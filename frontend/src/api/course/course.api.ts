import type {
  CreateCourseData,
  CreateCourseRequest,
  CourseDetailData,
  CourseLikeData,
  CourseShopVisitData,
  LikedCourseListData,
  MyCourseListData,
  UpdateCourseData,
  UpdateCourseRequest,
  UpdateCourseVisibilityData,
  UpdateCourseVisibilityRequest,
} from "@sopum-map/shared";

import { apiClient } from "../client";

/**
 * 사용자 코스를 생성합니다.
 */
export async function createCourse(
  input: CreateCourseRequest,
): Promise<CreateCourseData> {
  return apiClient<CreateCourseData>("/courses", {
    method: "POST",
    body: input,
  });
}

/**
 * 코스 상세 정보를 조회합니다.
 */
export async function getCourseDetail(
  courseId: string,
): Promise<CourseDetailData> {
  return apiClient<CourseDetailData>(`/courses/${courseId}`);
}

/**
 * 내가 만든 코스 목록을 조회합니다.
 */
export async function getMyCourses(
  cursor?: string,
): Promise<MyCourseListData> {
  const searchParams = new URLSearchParams({ limit: "20" });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return apiClient<MyCourseListData>(`/me/courses?${searchParams}`);
}

/**
 * 내가 좋아요한 코스 목록을 조회합니다.
 */
export async function getMyLikedCourses(
  cursor?: string,
): Promise<LikedCourseListData> {
  const searchParams = new URLSearchParams({ limit: "20" });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return apiClient<LikedCourseListData>(
    `/me/liked-courses?${searchParams}`,
  );
}

/**
 * 코스에 좋아요를 추가합니다.
 */
export async function likeCourse(courseId: string): Promise<CourseLikeData> {
  return apiClient<CourseLikeData>(`/courses/${courseId}/likes`, {
    method: "POST",
  });
}

/**
 * 코스 좋아요를 해제합니다.
 */
export async function unlikeCourse(
  courseId: string,
): Promise<CourseLikeData> {
  return apiClient<CourseLikeData>(`/courses/${courseId}/likes`, {
    method: "DELETE",
  });
}

/** 코스 상점을 방문 완료 상태로 저장합니다. */
export async function setCourseShopVisited(
  courseId: string,
  shopId: string,
): Promise<CourseShopVisitData> {
  return apiClient<CourseShopVisitData>(
    `/courses/${courseId}/shops/${shopId}/visit`,
    { method: "PUT" },
  );
}

/** 코스 상점을 미방문 상태로 되돌립니다. */
export async function unsetCourseShopVisited(
  courseId: string,
  shopId: string,
): Promise<CourseShopVisitData> {
  return apiClient<CourseShopVisitData>(
    `/courses/${courseId}/shops/${shopId}/visit`,
    { method: "DELETE" },
  );
}

/**
 * 내가 만든 코스의 공개 여부를 바꿉니다.
 */
export async function updateCourseVisibility(
  courseId: string,
  input: UpdateCourseVisibilityRequest,
): Promise<UpdateCourseVisibilityData> {
  return apiClient<UpdateCourseVisibilityData>(
    `/courses/${courseId}/visibility`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

/**
 * 사용자 코스를 수정합니다.
 */
export async function updateCourse(
  courseId: string,
  input: UpdateCourseRequest,
): Promise<UpdateCourseData> {
  return apiClient<UpdateCourseData>(`/courses/${courseId}`, {
    method: "PATCH",
    body: input,
  });
}

/**
 * 사용자 코스를 삭제합니다.
 */
export async function deleteCourse(courseId: string): Promise<void> {
  return apiClient<void>(`/courses/${courseId}`, {
    method: "DELETE",
  });
}
