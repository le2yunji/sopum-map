import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  decodeCourseCursor,
  encodeCourseCursor,
} from "./course-cursor.js";

describe("course cursor", () => {
  it("같은 시각의 서로 다른 항목 ID를 잃지 않고 복원합니다", () => {
    const createdAt = new Date("2026-10-12T00:00:00.000Z");
    const firstId = new Types.ObjectId("6a8a68e15e2aa43be6a6549d");
    const secondId = new Types.ObjectId("6a8a68e15e2aa43be6a6549e");

    const first = decodeCourseCursor(
      encodeCourseCursor({ createdAt, id: firstId }),
    );
    const second = decodeCourseCursor(
      encodeCourseCursor({ createdAt, id: secondId }),
    );

    expect(first).toEqual({ createdAt, id: firstId });
    expect(second).toEqual({ createdAt, id: secondId });
  });

  it("손상된 커서에 명시적인 오류 코드를 반환합니다", () => {
    expect(() => decodeCourseCursor("not-a-valid-cursor")).toThrow(
      expect.objectContaining({
        status: 400,
        code: "INVALID_COURSE_CURSOR",
      }),
    );
  });
});
