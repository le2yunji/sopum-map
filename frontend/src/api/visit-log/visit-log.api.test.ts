// frontend/src/api/visit-log/visit-log.api.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({ apiClient: vi.fn() }));

vi.mock("../client", () => ({ apiClient: apiMocks.apiClient }));

import { createVisitLog, createVisitLogsSearchParams } from "./visit-log.api";

beforeEach(() => {
  vi.clearAllMocks();
  apiMocks.apiClient.mockResolvedValue({ visitLogId: "visit-log-1" });
});

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

describe("createVisitLog", () => {
  it("상점 방문 로그 작성 주소에 요청 본문을 POST한다", async () => {
    const input = {
      visitedAt: "2026-10-13T03:00:00.000Z",
      selectedTagKeys: ["cute"],
      content: null,
      imageKeys: [],
    } as const;

    await expect(createVisitLog("shop-1", input)).resolves.toEqual({
      visitLogId: "visit-log-1",
    });
    expect(apiMocks.apiClient).toHaveBeenCalledWith(
      "/shops/shop-1/visit-logs",
      { method: "POST", body: input },
    );
  });
});
