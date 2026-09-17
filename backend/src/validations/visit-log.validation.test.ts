// backend/src/validations/visit-log.validation.test.ts

import { describe, expect, it } from "vitest";

import {
  getVisitLogsParamsSchema,
  getVisitLogsQuerySchema,
} from "./visit-log.validation.js";

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
