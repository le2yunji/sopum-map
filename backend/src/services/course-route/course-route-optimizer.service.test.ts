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

  it("상점이 7개인 코스는 거부한다", () => {
    const sevenShopDistances = Array.from({ length: 7 }, () =>
      Array<number>(7).fill(0),
    );

    expect(() => optimizeCourseRoute(sevenShopDistances)).toThrow(
      "코스 최적화는 최대 6개 상점까지 지원합니다.",
    );
  });
});
