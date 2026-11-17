import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
}));

vi.mock("../client", () => ({
  apiClient: apiMocks.apiClient,
}));

import { getMyActivitySummary, getMyVisitedShops } from "./me.api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("내 활동 요약 API", () => {
  it("현재 사용자의 활동 집계 경로를 조회한다", async () => {
    const summary = {
      createdCourseCount: 2,
      visitLogCount: 4,
      visitedShopCount: 3,
    };
    apiMocks.apiClient.mockResolvedValue(summary);

    await expect(getMyActivitySummary()).resolves.toEqual(summary);
    expect(apiMocks.apiClient).toHaveBeenCalledWith("/me/activity-summary");
  });
});

describe("내 방문 상점 API", () => {
  it("페이지 조건을 쿼리 문자열로 전달한다", async () => {
    const page = {
      items: [],
      pagination: {
        totalCount: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
        hasNext: false,
      },
    };
    apiMocks.apiClient.mockResolvedValue(page);

    await expect(
      getMyVisitedShops({ page: 2, limit: 10 }),
    ).resolves.toEqual(page);
    expect(apiMocks.apiClient).toHaveBeenCalledWith(
      "/me/visited-shops?page=2&limit=10",
    );
  });

  it("조회 조건이 없으면 기본 경로를 호출한다", async () => {
    apiMocks.apiClient.mockResolvedValue({ items: [] });

    await getMyVisitedShops();

    expect(apiMocks.apiClient).toHaveBeenCalledWith("/me/visited-shops");
  });
});
