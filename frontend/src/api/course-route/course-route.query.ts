import { useMutation, useQuery } from "@tanstack/react-query";
import type { OptimizeCourseRouteRequest } from "@sopum-map/shared";
import { getCourseWalkingRoute, optimizeCourseRoute } from "./course-route.api";

export const courseRouteQueryKeys = {
  all: ["course-route"] as const,
  walking: (courseId: string) =>
    [...courseRouteQueryKeys.all, courseId, "walking"] as const,
};

/**
 * 선택한 코스 상점의 추천 방문 순서를 계산합니다.
 */
export function useOptimizeCourseRoute() {
  return useMutation({
    mutationFn: (input: OptimizeCourseRouteRequest) =>
      optimizeCourseRoute(input),
  });
}

/** 코스 상세의 실제 도보 경로를 조회합니다. */
export function useCourseWalkingRoute(courseId?: string) {
  return useQuery({
    queryKey: courseRouteQueryKeys.walking(courseId ?? ""),
    queryFn: () => {
      if (!courseId) {
        throw new Error("courseId가 필요합니다.");
      }

      return getCourseWalkingRoute(courseId);
    },
    enabled: Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}
