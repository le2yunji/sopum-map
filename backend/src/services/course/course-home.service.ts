import { Types } from "mongoose";
import type { HomeCourseRecommendationsData } from "@sopum-map/shared";
import {
  HOME_COURSE_RECENT_LIKE_DAYS,
  MAX_HOME_COURSE_CANDIDATES,
} from "../../constants/course-home.constants.js";

import CourseHomeRecommendationModel from "../../models/course-home-recommendation.model.js";
import CourseLikeModel from "../../models/course-like.model.js";
import CourseModel from "../../models/course.model.js";
import {
  getKoreaDayWindow,
  MILLISECONDS_PER_DAY,
} from "../../utils/korea-date.js";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";

import {
  mergeTrendingCandidates,
  orderCandidatesForDate,
  selectRegionDiverseCourses,
} from "./course-home-recommendation.js";

import { loadPublicCourseListItems } from "./public-course-display.service.js";

import type { PublicCourseDocument } from "./public-course-list.mapper.js";

type HomeCourseSnapshot = Readonly<{
  dateKey: string;
  candidateCourseIds: readonly Types.ObjectId[];
  expiresAt: Date;
}>;

type CourseIdDocument = Readonly<{
  _id: Types.ObjectId;
}>;

type RecentlyLikedCourseDocument = Readonly<{
  _id: Types.ObjectId;
  likeCount: number;
  latestLikedAt: Date;
}>;

/** 저장된 날짜별 홈 추천 스냅샷을 조회합니다. */
async function findHomeCourseSnapshot(
  dateKey: string,
): Promise<HomeCourseSnapshot | null> {
  const snapshot = await CourseHomeRecommendationModel.findOne({
    dateKey,
  })
    .select({
      dateKey: 1,
      candidateCourseIds: 1,
      expiresAt: 1,
    })
    .lean();

  if (!snapshot) {
    return null;
  }

  return {
    dateKey: snapshot.dateKey,
    candidateCourseIds: snapshot.candidateCourseIds,
    expiresAt: snapshot.expiresAt,
  };
}

/** 해당 한국 날짜가 시작되기 전에 공개된 최신 코스 후보를 조회합니다. */
async function findLatestCourseCandidates(
  startAt: Date,
): Promise<readonly CourseIdDocument[]> {
  return CourseModel.find({
    isPublic: true,
    createdAt: {
      $lt: startAt,
    },
  })
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .limit(MAX_HOME_COURSE_CANDIDATES)
    .select({
      _id: 1,
    })
    .lean();
}

/** 한국 날짜 시작 직전 7일 동안 좋아요를 받은 공개 코스를 조회합니다. */
async function findRecentlyLikedCourseCandidates(
  startAt: Date,
): Promise<readonly RecentlyLikedCourseDocument[]> {
  const recentLikeStartAt = new Date(
    startAt.getTime() - HOME_COURSE_RECENT_LIKE_DAYS * MILLISECONDS_PER_DAY,
  );

  return CourseLikeModel.aggregate<RecentlyLikedCourseDocument>([
    {
      $match: {
        createdAt: {
          $gte: recentLikeStartAt,
          $lt: startAt,
        },
      },
    },
    {
      $group: {
        _id: "$courseId",
        likeCount: {
          $sum: 1,
        },
        latestLikedAt: {
          $max: "$createdAt",
        },
      },
    },
    {
      $lookup: {
        from: CourseModel.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $match: {
        "course.0.isPublic": true,
      },
    },
    {
      $sort: {
        likeCount: -1,
        latestLikedAt: -1,
        _id: -1,
      },
    },
    {
      $limit: MAX_HOME_COURSE_CANDIDATES,
    },
    {
      $project: {
        _id: 1,
        likeCount: 1,
        latestLikedAt: 1,
      },
    },
  ]);
}

/** 최신·인기 후보를 합쳐 날짜별로 고정된 추천 후보 순서를 만듭니다. */
async function createHomeCourseCandidateIds(
  dateKey: string,
  startAt: Date,
): Promise<readonly Types.ObjectId[]> {
  const [latestCourses, recentlyLikedCourses] = await Promise.all([
    findLatestCourseCandidates(startAt),
    findRecentlyLikedCourseCandidates(startAt),
  ]);

  const mergedCourseIds = mergeTrendingCandidates(
    latestCourses.map((course) => course._id.toString()),
    recentlyLikedCourses.map((course) => course._id.toString()),
  );

  return orderCandidatesForDate(mergedCourseIds, dateKey).map(
    (courseId) => new Types.ObjectId(courseId),
  );
}

/** 날짜별 추천 후보를 한 번만 계산해 저장하고 같은 날짜에는 재사용합니다. */
export async function getOrCreateHomeCourseSnapshot(
  now = new Date(),
): Promise<HomeCourseSnapshot> {
  const { dateKey, startAt, expiresAt } = getKoreaDayWindow(now);

  const existingSnapshot = await findHomeCourseSnapshot(dateKey);

  if (existingSnapshot) {
    return existingSnapshot;
  }

  const candidateCourseIds = await createHomeCourseCandidateIds(
    dateKey,
    startAt,
  );

  try {
    await CourseHomeRecommendationModel.updateOne(
      {
        dateKey,
      },
      {
        $setOnInsert: {
          dateKey,
          candidateCourseIds,
          expiresAt,
        },
      },
      {
        upsert: true,
      },
    );
  } catch (error) {
    // 동시에 들어온 다른 요청이 먼저 저장했다면 그 스냅샷을 사용합니다.
    if (!isMongoDuplicateKeyError(error)) {
      throw error;
    }
  }

  const savedSnapshot = await findHomeCourseSnapshot(dateKey);

  if (!savedSnapshot) {
    throw new Error("홈 코스 추천 스냅샷을 저장하지 못했습니다.");
  }

  return savedSnapshot;
}

/** 오늘의 공개 후보에서 지역이 겹치지 않도록 홈 추천 코스를 고릅니다. */
export async function getHomeCourseRecommendations(
  now = new Date(),
): Promise<HomeCourseRecommendationsData> {
  const snapshot = await getOrCreateHomeCourseSnapshot(now);

  if (snapshot.candidateCourseIds.length === 0) {
    return {
      items: [],
    };
  }

  const courses = await CourseModel.find({
    _id: {
      $in: snapshot.candidateCourseIds,
    },
    isPublic: true,
  }).lean();

  const courseById = new Map<string, PublicCourseDocument>(
    courses.map((course) => [course._id.toString(), course]),
  );

  /*
   * MongoDB의 $in 조회 결과는 입력한 ID 순서를 보장하지 않으므로
   * 스냅샷에 저장된 순서로 다시 정렬합니다.
   */
  const orderedCourses = snapshot.candidateCourseIds
    .map((courseId) => courseById.get(courseId.toString()))
    .filter((course): course is PublicCourseDocument => course !== undefined);

  const selectedCourses = selectRegionDiverseCourses(orderedCourses);

  const items = await loadPublicCourseListItems(selectedCourses);

  return {
    items,
  };
}
