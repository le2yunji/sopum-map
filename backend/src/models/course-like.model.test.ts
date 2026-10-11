import { describe, expect, it } from "vitest";

import CourseLikeModel from "./course-like.model.js";

describe("CourseLike model", () => {
  it("사용자와 코스 조합의 중복 좋아요를 막습니다", () => {
    const indexes = CourseLikeModel.schema.indexes();

    expect(indexes).toContainEqual([
      { userId: 1, courseId: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });

  it("사용자의 찜 목록을 안정적인 시간순으로 조회할 인덱스를 가집니다", () => {
    const indexes = CourseLikeModel.schema.indexes();

    expect(indexes).toContainEqual([
      { userId: 1, createdAt: -1, _id: -1 },
      expect.any(Object),
    ]);
  });
});
