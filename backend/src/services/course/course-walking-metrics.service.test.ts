import { describe, expect, it } from "vitest";

import { addWalkingMetricsToCourseShops } from "./course-walking-metrics.service.js";

describe("addWalkingMetricsToCourseShops", () => {
  it("첫 상점은 null, 이후 상점은 직전 방문지에서 오는 거리와 시간을 저장합니다", () => {
    const result = addWalkingMetricsToCourseShops(
      [
        { shopId: "shop-1", order: 1, memo: null },
        { shopId: "shop-2", order: 2, memo: "메모" },
        { shopId: "shop-3", order: 3, memo: null },
      ],
      [
        [
          { distanceMeters: 0, durationSeconds: 0 },
          { distanceMeters: 620, durationSeconds: 421 },
          { distanceMeters: 900, durationSeconds: 600 },
        ],
        [
          { distanceMeters: 610, durationSeconds: 410 },
          { distanceMeters: 0, durationSeconds: 0 },
          { distanceMeters: 1250, durationSeconds: 720 },
        ],
        [
          { distanceMeters: 880, durationSeconds: 590 },
          { distanceMeters: 1220, durationSeconds: 700 },
          { distanceMeters: 0, durationSeconds: 0 },
        ],
      ],
    );

    expect(result).toEqual([
      {
        shopId: "shop-1",
        order: 1,
        memo: null,
        walkingDistanceFromPreviousMeters: null,
        walkingDurationFromPreviousSeconds: null,
      },
      {
        shopId: "shop-2",
        order: 2,
        memo: "메모",
        walkingDistanceFromPreviousMeters: 620,
        walkingDurationFromPreviousSeconds: 421,
      },
      {
        shopId: "shop-3",
        order: 3,
        memo: null,
        walkingDistanceFromPreviousMeters: 1250,
        walkingDurationFromPreviousSeconds: 720,
      },
    ]);
  });
});
