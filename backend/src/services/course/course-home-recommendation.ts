import { createHash } from "node:crypto";

import type { ShopRegionGroup } from "@sopum-map/shared";
import {
  HOME_COURSE_DISPLAY_LIMIT,
  HOME_COURSE_PRIMARY_CANDIDATE_LIMIT,
  MAX_HOME_COURSE_CANDIDATES,
} from "../../constants/course-home.constants.js";

type RegionCourse = Readonly<{
  regionGroup: ShopRegionGroup;
}>;

/** 최신 후보와 인기 후보를 중복 없이 최대 20개로 합칩니다. */
export function mergeTrendingCandidates(
  latestCourseIds: readonly string[],
  likedCourseIds: readonly string[],
): readonly string[] {
  const candidates: string[] = [];
  const seenCourseIds = new Set<string>();

  /** 아직 포함되지 않은 코스만 후보 끝에 추가합니다. */
  const appendCandidate = (courseId: string) => {
    if (
      candidates.length >= MAX_HOME_COURSE_CANDIDATES ||
      seenCourseIds.has(courseId)
    ) {
      return;
    }

    seenCourseIds.add(courseId);
    candidates.push(courseId);
  };

  for (const courseId of latestCourseIds.slice(
    0,
    HOME_COURSE_PRIMARY_CANDIDATE_LIMIT,
  )) {
    appendCandidate(courseId);
  }

  for (const courseId of likedCourseIds.slice(
    0,
    HOME_COURSE_PRIMARY_CANDIDATE_LIMIT,
  )) {
    appendCandidate(courseId);
  }

  const remainingLatestCourseIds = latestCourseIds.slice(
    HOME_COURSE_PRIMARY_CANDIDATE_LIMIT,
  );
  const remainingLikedCourseIds = likedCourseIds.slice(
    HOME_COURSE_PRIMARY_CANDIDATE_LIMIT,
  );

  let latestIndex = 0;
  let likedIndex = 0;

  while (
    candidates.length < MAX_HOME_COURSE_CANDIDATES &&
    (latestIndex < remainingLatestCourseIds.length ||
      likedIndex < remainingLikedCourseIds.length)
  ) {
    const latestCourseId = remainingLatestCourseIds[latestIndex];

    if (latestCourseId !== undefined) {
      appendCandidate(latestCourseId);
      latestIndex += 1;
    }

    if (candidates.length >= MAX_HOME_COURSE_CANDIDATES) {
      break;
    }

    const likedCourseId = remainingLikedCourseIds[likedIndex];

    if (likedCourseId !== undefined) {
      appendCandidate(likedCourseId);
      likedIndex += 1;
    }
  }

  return candidates;
}

/** 날짜와 코스 ID를 해시해 모든 사용자에게 같은 일일 순서를 만듭니다. */
export function orderCandidatesForDate(
  courseIds: readonly string[],
  dateKey: string,
): readonly string[] {
  return courseIds
    .map((courseId) => ({
      courseId,
      hash: createHash("sha256").update(`${dateKey}:${courseId}`).digest("hex"),
    }))
    .sort(
      (first, second) =>
        first.hash.localeCompare(second.hash) ||
        first.courseId.localeCompare(second.courseId),
    )
    .map((candidate) => candidate.courseId);
}

/** 가능한 한 서로 다른 지역을 먼저 선택하고 부족한 자리는 기존 순서로 채웁니다. */
export function selectRegionDiverseCourses<TCourse extends RegionCourse>(
  courses: readonly TCourse[],
): readonly TCourse[] {
  const selectedCourses: TCourse[] = [];
  const deferredCourses: TCourse[] = [];
  const selectedRegions = new Set<ShopRegionGroup>();

  for (const course of courses) {
    if (
      selectedCourses.length < HOME_COURSE_DISPLAY_LIMIT &&
      !selectedRegions.has(course.regionGroup)
    ) {
      selectedRegions.add(course.regionGroup);
      selectedCourses.push(course);
      continue;
    }

    deferredCourses.push(course);
  }

  for (const course of deferredCourses) {
    if (selectedCourses.length >= HOME_COURSE_DISPLAY_LIMIT) {
      break;
    }

    selectedCourses.push(course);
  }

  return selectedCourses;
}
