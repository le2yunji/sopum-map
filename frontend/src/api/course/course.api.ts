import type {
  CreateCourseData,
  CreateCourseRequest,
  CourseDetailData,
  CourseListData,
  UpdateCourseData,
  UpdateCourseRequest,
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
export async function getMyCourses(): Promise<CourseListData> {
  return apiClient<CourseListData>("/me/courses");
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
