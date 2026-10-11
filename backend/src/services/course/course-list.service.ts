import { Types } from "mongoose";

import type {
  LikedCourseListData,
  MyCourseListData,
} from "@sopum-map/shared";

import CourseLikeModel from "../../models/course-like.model.js";
import CourseModel from "../../models/course.model.js";
import ShopModel from "../../models/shop.model.js";
import UserModel from "../../models/user.model.js";
import { getMainShopImageUrl } from "../../utils/shop-image.js";
import { decodeCourseCursor, encodeCourseCursor } from "./course-cursor.js";
import {
  createCourseCursorPage,
  createCourseListAuthor,
  mapLikedCourseListItem,
  mapMyCourseListItem,
} from "./course-list.mapper.js";

type CourseListPagination = Readonly<{
  cursor?: string;
  limit: number;
}>;

/** 커서가 있으면 최신순 복합 정렬의 다음 범위를 MongoDB 조건으로 만듭니다. */
function createCursorFilter(cursor?: string) {
  if (!cursor) {
    return {};
  }

  const decoded = decodeCourseCursor(cursor);

  return {
    $or: [
      { createdAt: { $lt: decoded.createdAt } },
      { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
    ],
  };
}

/** 여러 코스의 좋아요 수를 한 번의 집계로 조회합니다. */
async function getLikeCountByCourseId(courseIds: readonly Types.ObjectId[]) {
  if (courseIds.length === 0) {
    return new Map<string, number>();
  }

  const counts = await CourseLikeModel.aggregate<{
    _id: Types.ObjectId;
    count: number;
  }>([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);

  return new Map(counts.map((item) => [item._id.toString(), item.count]));
}

/** 여러 코스의 첫 방문 상점 대표 이미지를 한 번에 조회합니다. */
async function getMainImageByCourseId(
  courses: readonly Readonly<{
    _id: Types.ObjectId;
    shops: readonly Readonly<{ shopId: Types.ObjectId; order: number }>[];
  }>[],
) {
  const firstShopByCourseId = new Map<string, Types.ObjectId>();

  for (const course of courses) {
    const firstShop = [...course.shops].sort(
      (first, second) => first.order - second.order,
    )[0];

    if (firstShop) {
      firstShopByCourseId.set(course._id.toString(), firstShop.shopId);
    }
  }

  const shopIds = [...firstShopByCourseId.values()];
  const shops = await ShopModel.find({ _id: { $in: shopIds } })
    .select({ _id: 1, images: 1 })
    .lean();
  const imageByShopId = new Map(
    shops.map((shop) => [
      shop._id.toString(),
      getMainShopImageUrl(shop.images ?? []),
    ]),
  );

  return new Map(
    [...firstShopByCourseId].map(([courseId, shopId]) => [
      courseId,
      imageByShopId.get(shopId.toString()) ?? null,
    ]),
  );
}

/** 내가 만든 사용자 코스를 커서 기반으로 조회합니다. */
export async function getMyCourseList(
  userId: string,
  { cursor, limit }: CourseListPagination,
): Promise<MyCourseListData> {
  const courses = await CourseModel.find({
    userId: new Types.ObjectId(userId),
    courseType: "user_created",
    ...createCursorFilter(cursor),
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select({
      sourceFolderId: 1,
      title: 1,
      description: 1,
      regionGroup: 1,
      isPublic: 1,
      shops: 1,
      courseType: 1,
      userId: 1,
      createdAt: 1,
      updatedAt: 1,
    })
    .lean();

  const visibleCourses = courses.slice(0, limit);
  const courseIds = visibleCourses.map((course) => course._id);
  const [likeCountByCourseId, mainImageByCourseId] = await Promise.all([
    getLikeCountByCourseId(courseIds),
    getMainImageByCourseId(visibleCourses),
  ]);

  return createCourseCursorPage(courses, limit, (course) =>
    mapMyCourseListItem(course, {
      mainImageUrl: mainImageByCourseId.get(course._id.toString()) ?? null,
      likeCount: likeCountByCourseId.get(course._id.toString()) ?? 0,
    }),
  );
}

/** 내가 좋아요한 공개·비공개 코스를 좋아요한 최신 순서로 조회합니다. */
export async function getMyLikedCourseList(
  userId: string,
  { cursor, limit }: CourseListPagination,
): Promise<LikedCourseListData> {
  const likes = await CourseLikeModel.find({
    userId: new Types.ObjectId(userId),
    ...createCursorFilter(cursor),
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select({ courseId: 1, createdAt: 1 })
    .lean();

  const visibleLikes = likes.slice(0, limit);
  const courseIds = visibleLikes.map((like) => like.courseId);
  const courses = await CourseModel.find({ _id: { $in: courseIds } })
    .select({
      courseType: 1,
      userId: 1,
      sourceFolderId: 1,
      title: 1,
      description: 1,
      regionGroup: 1,
      isPublic: 1,
      shops: 1,
      createdAt: 1,
      updatedAt: 1,
    })
    .lean();
  const courseById = new Map(
    courses.map((course) => [course._id.toString(), course]),
  );
  const userIds = courses.flatMap((course) =>
    course.userId ? [course.userId] : [],
  );

  const [users, likeCountByCourseId, mainImageByCourseId] = await Promise.all([
    UserModel.find({ _id: { $in: userIds } })
      .select({ _id: 1, nickname: 1, profileImage: 1 })
      .lean(),
    getLikeCountByCourseId(courses.map((course) => course._id)),
    getMainImageByCourseId(courses),
  ]);
  const userById = new Map(users.map((user) => [user._id.toString(), user]));

  const mappedLikes = visibleLikes.flatMap((like) => {
    const course = courseById.get(like.courseId.toString());

    if (!course) {
      return [];
    }

    const authorUser = course.userId
      ? (userById.get(course.userId.toString()) ?? null)
      : null;

    return [
      mapLikedCourseListItem({
        course,
        likedAt: like.createdAt,
        mainImageUrl: mainImageByCourseId.get(course._id.toString()) ?? null,
        likeCount: likeCountByCourseId.get(course._id.toString()) ?? 0,
        author: createCourseListAuthor(course, authorUser),
      }),
    ];
  });

  const lastLike = visibleLikes.at(-1);
  const hasNext = likes.length > limit;

  return {
    items: mappedLikes,
    hasNext,
    nextCursor:
      hasNext && lastLike
        ? encodeCourseCursor({
            createdAt: lastLike.createdAt,
            id: lastLike._id,
          })
        : null,
  };
}
