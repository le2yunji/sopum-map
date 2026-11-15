import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
}));

vi.mock("../client", () => ({
  apiClient: apiMocks.apiClient,
}));

import { getMyActivitySummary } from "./me.api";

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
