import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import CourseShopVisitModel from "./course-shop-visit.model.js";

describe("CourseShopVisit model", () => {
  it("사용자·코스·상점 조합을 하나만 허용하는 인덱스를 가진다", () => {
    expect(CourseShopVisitModel.schema.indexes()).toContainEqual([
      { userId: 1, courseId: 1, shopId: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });

  it("사용자·코스·상점이 모두 필요하다", async () => {
    const visit = new CourseShopVisitModel({
      userId: new Types.ObjectId(),
      courseId: new Types.ObjectId(),
    });

    await expect(visit.validate()).rejects.toThrow();
  });
});
