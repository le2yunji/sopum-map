import { useMutation, useQuery } from "@tanstack/react-query";
import type { OptimizeCourseRouteRequest } from "@sopum-map/shared";
import { optimizeCourseRoute } from "./course-route.api";
import { getCourseWalkingRoute } from "./course-route.api";

/**
 * 선택한 코스 상점의 추천 방문 순서를 계산합니다.
 */
export function useOptimizeCourseRoute() {
  return useMutation({
    mutationFn: (input: OptimizeCourseRouteRequest) =>
      optimizeCourseRoute(input),
  });
}

// frontend/src/api/course/course-route.query.ts

export const courseRouteQueryKeys = {
  all: ["course-route"] as const,

  walkingRoute: (courseId: string) =>
    [...courseRouteQueryKeys.all, courseId, "walking-route"] as const,
};

export function useCourseWalkingRoute(courseId?: string) {
  return useQuery({
    queryKey: courseRouteQueryKeys.walkingRoute(courseId ?? ""),

    queryFn: () => {
      if (!courseId) {
        throw new Error("courseId가 필요합니다.");
      }

      return getCourseWalkingRoute(courseId);
    },

    enabled: Boolean(courseId),
  });
}
