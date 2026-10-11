import { describe, expect, it } from "vitest";

import {
  formatWalkingSegment,
  getOrderedWalkingRouteSegments,
} from "./course-route-display";

describe("formatWalkingSegment", () => {
  it("1km 미만 구간을 올림한 도보 시간과 미터로 표시합니다", () => {
    expect(
      formatWalkingSegment({
        distanceMeters: 620,
        durationSeconds: 421,
      }),
    ).toBe("도보 8분 · 620m");
  });

  it("1km 이상 구간을 소수점 한 자리 km로 표시합니다", () => {
    expect(
      formatWalkingSegment({
        distanceMeters: 1250,
        durationSeconds: 720,
      }),
    ).toBe("도보 12분 · 1.3km");
  });
});

describe("getOrderedWalkingRouteSegments", () => {
  it("방문 순서와 이어지는 도보 구간만 순서대로 반환합니다", () => {
    const firstToSecond = {
      fromShopId: "shop-1",
      toShopId: "shop-2",
      distanceMeters: 100,
      durationSeconds: 120,
      coordinates: [],
    };
    const secondToThird = {
      fromShopId: "shop-2",
      toShopId: "shop-3",
      distanceMeters: 200,
      durationSeconds: 240,
      coordinates: [],
    };
    const unrelated = {
      fromShopId: "shop-1",
      toShopId: "shop-3",
      distanceMeters: 150,
      durationSeconds: 180,
      coordinates: [],
    };

    const result = getOrderedWalkingRouteSegments(
      [
        { id: "shop-3", order: 3 },
        { id: "shop-1", order: 1 },
        { id: "shop-2", order: 2 },
      ],
      [secondToThird, unrelated, firstToSecond],
    );

    expect(result).toEqual([firstToSecond, secondToThird]);
  });
});
