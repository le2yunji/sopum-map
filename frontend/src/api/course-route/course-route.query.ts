import { useMutation } from "@tanstack/react-query";
import type { OptimizeCourseRouteRequest } from "@sopum-map/shared";
import { optimizeCourseRoute } from "./course-route.api";

/**
 * 선택한 코스 상점의 추천 방문 순서를 계산합니다.
 */
export function useOptimizeCourseRoute() {
  return useMutation({
    mutationFn: (input: OptimizeCourseRouteRequest) =>
      optimizeCourseRoute(input),
  });
}
