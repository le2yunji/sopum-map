// backend/src/validations/visit-log.validation.test.ts

import { describe, expect, it } from "vitest";

import {
  createVisitLogSchema,
  getVisitLogsParamsSchema,
  getVisitLogsQuerySchema,
} from "./visit-log.validation.js";

const shopId = "6a8a68e15e2aa43be6a6549d";

/** 현재 시각보다 하루 전인 정상 방문 로그 요청을 만듭니다. */
function createValidVisitLogRequest() {
  return {
    params: { shopId },
    body: {
      visitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      selectedTagKeys: ["cute"],
      content: "아기자기한 소품이 많았어요.",
      imageKeys: [],
    },
  };
}

describe("createVisitLogSchema", () => {
  it("이미지 없이 방문일과 태그가 있는 요청을 허용한다", () => {
    const request = createValidVisitLogRequest();

    expect(createVisitLogSchema.parse(request)).toEqual(request);
  });

  const invalidTagSelections: readonly string[][] = [
    [],
    ["cute", "vintage", "cozy", "hip", "lovely", "kitsch"],
  ];

  it.each(invalidTagSelections)("태그가 1개 미만이거나 5개를 초과하면 거부한다", (selectedTagKeys) => {
    expect(() =>
      createVisitLogSchema.parse({
        ...createValidVisitLogRequest(),
        body: { ...createValidVisitLogRequest().body, selectedTagKeys },
      }),
    ).toThrow();
  });

  it("중복된 태그를 거부한다", () => {
    expect(() =>
      createVisitLogSchema.parse({
        ...createValidVisitLogRequest(),
        body: {
          ...createValidVisitLogRequest().body,
          selectedTagKeys: ["cute", "cute"],
        },
      }),
    ).toThrow();
  });

  it("정의되지 않은 태그를 거부한다", () => {
    expect(() =>
      createVisitLogSchema.parse({
        ...createValidVisitLogRequest(),
        body: {
          ...createValidVisitLogRequest().body,
          selectedTagKeys: ["unknown-tag"],
        },
      }),
    ).toThrow();
  });

  it("300자를 초과한 방문 글을 거부한다", () => {
    expect(() =>
      createVisitLogSchema.parse({
        ...createValidVisitLogRequest(),
        body: {
          ...createValidVisitLogRequest().body,
          content: "가".repeat(301),
        },
      }),
    ).toThrow();
  });

  it("S3 도입 전에는 이미지 키가 있는 요청을 거부한다", () => {
    expect(() =>
      createVisitLogSchema.parse({
        ...createValidVisitLogRequest(),
        body: {
          ...createValidVisitLogRequest().body,
          imageKeys: ["visit-logs/user/image.webp"],
        },
      }),
    ).toThrow();
  });

  it("미래 방문일을 거부한다", () => {
    expect(() =>
      createVisitLogSchema.parse({
        ...createValidVisitLogRequest(),
        body: {
          ...createValidVisitLogRequest().body,
          visitedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }),
    ).toThrow();
  });
});

describe("getVisitLogsParamsSchema", () => {
  it("올바른 shopId를 허용한다", () => {
    const result = getVisitLogsParamsSchema.parse({
      shopId: "6a8a68e15e2aa43be6a6549d",
    });

    expect(result.shopId).toBe("6a8a68e15e2aa43be6a6549d");
  });

  it("잘못된 shopId를 거부한다", () => {
    expect(() =>
      getVisitLogsParamsSchema.parse({
        shopId: "invalid-id",
      }),
    ).toThrow();
  });
});

describe("getVisitLogsQuerySchema", () => {
  it("기본 pagination을 적용한다", () => {
    const result = getVisitLogsQuerySchema.parse({});

    expect(result).toEqual({
      page: 1,
      limit: 10,
    });
  });

  it("query string을 number로 변환한다", () => {
    const result = getVisitLogsQuerySchema.parse({
      page: "2",
      limit: "20",
    });

    expect(result).toEqual({
      page: 2,
      limit: 20,
    });
  });
});
