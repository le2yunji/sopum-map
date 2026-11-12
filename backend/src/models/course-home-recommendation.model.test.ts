import { describe, expect, it } from "vitest";

import CourseHomeRecommendationModel from "./course-home-recommendation.model.js";

describe("CourseHomeRecommendationModel indexes", () => {
  it("날짜별 스냅샷 하나와 만료 시각 TTL을 보장한다", () => {
    expect(CourseHomeRecommendationModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ dateKey: 1 }, { unique: true }],
        [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
      ]),
    );
  });
});
