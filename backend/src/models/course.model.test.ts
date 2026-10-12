import { describe, expect, it } from "vitest";

import CourseModel from "./course.model.js";

describe("CourseModel indexes", () => {
  it("사용자·원본 폴더·지역 조합을 사용자 코스에서만 고유하게 유지합니다", () => {
    const indexes = CourseModel.schema.indexes();

    expect(indexes).toContainEqual([
      { userId: 1, sourceFolderId: 1, regionGroup: 1 },
      {
        unique: true,
        partialFilterExpression: {
          courseType: "user_created",
          sourceFolderId: { $type: "objectId" },
        },
      },
    ]);
  });
});
