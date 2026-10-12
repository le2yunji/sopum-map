import { describe, expect, it } from "vitest";

import { optimizeCourseRoute } from "./course-route-optimizer.service.js";

describe("optimizeCourseRoute", () => {
  const distances = [
    [0, 1, 10],
    [1, 0, 1],
    [10, 1, 0],
  ];

  it("시작점을 지정하지 않으면 전체 최단 방문 순서를 계산한다", () => {
    expect(optimizeCourseRoute(distances).totalDistanceMeters).toBe(2);
  });

  it("지정한 상점을 첫 방문 상점으로 고정한다", () => {
    const result = optimizeCourseRoute(distances, 1);

    expect(result.orderedIndexes[0]).toBe(1);
    expect(result.totalDistanceMeters).toBe(11);
  });

  it("범위를 벗어난 시작점은 거부한다", () => {
    expect(() => optimizeCourseRoute(distances, 3)).toThrow(
      "시작점 인덱스가 올바르지 않습니다.",
    );
  });
});
