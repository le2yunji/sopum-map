import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  createCourseSchema,
  getCourseListSchema,
  updateCourseSchema,
  updateCourseVisibilitySchema,
} from "./course.validation.js";

const courseId = "6a8a68e15e2aa43be6a6549d";

const validCreateCourseBody = {
  sourceFolderId: "6a8a68e15e2aa43be6a6549e",
  regionGroup: "seongsu-seoulforest",
  title: "성수 소품 산책",
  shops: [
    { shopId: "6a8a68e15e2aa43be6a6549f", order: 1 },
    { shopId: "6a8a68e15e2aa43be6a654a0", order: 2 },
  ],
};

describe("createCourseSchema", () => {
  it("regionGroup을 필수로 받습니다", () => {
    const { regionGroup: _regionGroup, ...bodyWithoutRegionGroup } =
      validCreateCourseBody;

    expect(() =>
      createCourseSchema.parse({ body: bodyWithoutRegionGroup }),
    ).toThrow();
  });

  it("정의된 regionGroup만 허용합니다", () => {
    expect(() =>
      createCourseSchema.parse({
        body: { ...validCreateCourseBody, regionGroup: "busan" },
      }),
    ).toThrow();
  });

  it.each([1, 7])("상점이 %i개인 생성 요청을 거부합니다", (shopCount) => {
    const shops = Array.from({ length: shopCount }, (_, index) => ({
      shopId: new Types.ObjectId().toString(),
      order: index + 1,
    }));

    expect(() =>
      createCourseSchema.parse({ body: { ...validCreateCourseBody, shops } }),
    ).toThrow();
  });

  it("생성할 코스의 공개 여부를 요청 값으로 유지합니다", () => {
    const result = createCourseSchema.parse({
      body: { ...validCreateCourseBody, isPublic: true },
    });

    expect(result.body.isPublic).toBe(true);
  });
});

describe("updateCourseSchema", () => {
  it("상점이 7개인 수정 요청을 거부합니다", () => {
    const shops = Array.from({ length: 7 }, (_, index) => ({
      shopId: new Types.ObjectId().toString(),
      order: index + 1,
    }));

    expect(() =>
      updateCourseSchema.parse({ params: { courseId }, body: { shops } }),
    ).toThrow();
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
