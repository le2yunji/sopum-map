import type {
  CourseWalkingRouteData,
  OptimizeCourseRouteData,
  OptimizeCourseRouteRequest,
} from "@sopum-map/shared";
import { apiClient } from "../client";

/**
 * 선택한 상점들의 추천 방문 순서를 계산합니다.
 */
export function optimizeCourseRoute(
  input: OptimizeCourseRouteRequest,
): Promise<OptimizeCourseRouteData> {
  return apiClient<OptimizeCourseRouteData>("/me/course-routes/optimize", {
    method: "POST",
    body: input,
  });
}

/** 저장된 코스 순서의 실제 도보 경로를 조회합니다. */
export function getCourseWalkingRoute(
  courseId: string,
): Promise<CourseWalkingRouteData> {
  return apiClient<CourseWalkingRouteData>(
    `/courses/${courseId}/walking-route`,
  );
}
