// frontend/src/api/visit-log/visit-log.api.test.ts

import { describe, expect, it } from "vitest";

import { createVisitLogsSearchParams } from "./visit-log.api";

describe("createVisitLogsSearchParams", () => {
  it("page와 limit을 query string으로 변환한다", () => {
    const result = createVisitLogsSearchParams({
      page: 2,
      limit: 10,
    });

    expect(result.toString()).toBe("page=2&limit=10");
  });

  it("값이 없으면 빈 query string을 반환한다", () => {
    const result = createVisitLogsSearchParams({});

    expect(result.toString()).toBe("");
  });
});
