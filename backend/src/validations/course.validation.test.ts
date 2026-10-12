import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  createCourseSchema,
  getCourseListSchema,
  updateCourseVisibilitySchema,
} from "./course.validation.js";

const courseId = "6a8a68e15e2aa43be6a6549d";

describe("createCourseSchema", () => {
  it("생성할 코스의 공개 여부를 요청 값으로 유지합니다", () => {
    const result = createCourseSchema.parse({
      body: {
        sourceFolderId: courseId,
        regionGroup: "seongsu-seoulforest",
        title: "성수 산책",
        isPublic: true,
        shops: [
          { shopId: "6a8a68e15e2aa43be6a65491", order: 1 },
          { shopId: "6a8a68e15e2aa43be6a65492", order: 2 },
        ],
      },
    });

    expect(result.body.isPublic).toBe(true);
  });
});

describe("updateCourseVisibilitySchema", () => {
  it("공개 여부는 boolean만 허용합니다", () => {
    expect(() =>
      updateCourseVisibilitySchema.parse({
        params: { courseId },
        body: { isPublic: "true" },
      }),
    ).toThrow();
  });
});

describe("getCourseListSchema", () => {
  it("목록 크기의 기본값으로 20을 사용합니다", () => {
    const result = getCourseListSchema.parse({ query: {} });

    expect(result.query).toEqual({ limit: 20 });
  });

  it("목록 크기는 1부터 20까지만 허용합니다", () => {
    expect(() =>
      getCourseListSchema.parse({ query: { limit: "0" } }),
    ).toThrow();
    expect(() =>
      getCourseListSchema.parse({ query: { limit: "21" } }),
    ).toThrow();
  });

  it("빈 커서와 512자를 넘는 커서를 거부합니다", () => {
    expect(() =>
      getCourseListSchema.parse({ query: { cursor: "" } }),
    ).toThrow();
    expect(() =>
      getCourseListSchema.parse({ query: { cursor: "a".repeat(513) } }),
    ).toThrow();
  });
});
