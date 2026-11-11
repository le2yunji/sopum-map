import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  decodePublicCourseCursor,
  encodePublicCourseCursor,
} from "./public-course-cursor.js";

describe("public course cursor", () => {
  it("인기순 커서의 정렬 위치를 잃지 않고 복원한다", () => {
    const cursor = {
      sort: "popular" as const,
      likeCount: 12,
      createdAt: new Date("2026-11-01T00:00:00.000Z"),
      id: new Types.ObjectId("6a8a68e15e2aa43be6a6549d"),
    };

    expect(
      decodePublicCourseCursor(encodePublicCourseCursor(cursor), "popular"),
    ).toEqual(cursor);
  });

  it("다른 정렬의 커서를 재사용하면 명시적인 오류를 반환한다", () => {
    const latestCursor = encodePublicCourseCursor({
      sort: "latest",
      createdAt: new Date("2026-11-01T00:00:00.000Z"),
      id: new Types.ObjectId("6a8a68e15e2aa43be6a6549d"),
    });

    expect(() => decodePublicCourseCursor(latestCursor, "popular")).toThrow(
      expect.objectContaining({
        status: 400,
        code: "INVALID_COURSE_CURSOR",
      }),
    );
  });
});
