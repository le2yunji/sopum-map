import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  getMyActivitySummary: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: queryMocks.useQuery,
}));

vi.mock("@/api/me/me.api", () => ({
  getMyActivitySummary: queryMocks.getMyActivitySummary,
}));

import { meQueryKeys } from "@/api/me/me.query-keys";

import { useMyActivitySummary } from "./useMyActivitySummary";

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useQuery.mockImplementation((options) => options);
});

describe("useMyActivitySummary", () => {
  it("활동 요약 전용 캐시 키와 API 함수를 사용한다", () => {
    useMyActivitySummary();

    expect(queryMocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: meQueryKeys.activitySummary(),
        queryFn: queryMocks.getMyActivitySummary,
        enabled: true,
      }),
    );
  });

  it("비로그인 상태에서는 조회를 실행하지 않는다", () => {
    useMyActivitySummary(false);

    expect(queryMocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });
});
