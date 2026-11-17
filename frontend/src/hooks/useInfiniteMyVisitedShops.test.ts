import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  getMyVisitedShops: vi.fn(),
  useInfiniteQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: queryMocks.useInfiniteQuery,
}));

vi.mock("@/api/me/me.api", () => ({
  getMyVisitedShops: queryMocks.getMyVisitedShops,
}));

import { meQueryKeys } from "@/api/me/me.query-keys";

import { useInfiniteMyVisitedShops } from "./useInfiniteMyVisitedShops";

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useInfiniteQuery.mockImplementation((options) => options);
});

describe("useInfiniteMyVisitedShops", () => {
  it("방문 상점 전용 키로 다음 페이지를 조회합니다", async () => {
    const query = useInfiniteMyVisitedShops() as unknown as {
      queryKey: readonly unknown[];
      queryFn: (context: { pageParam: number }) => Promise<unknown>;
      getNextPageParam: (page: {
        pagination: { hasNext: boolean; page: number };
      }) => number | undefined;
    };

    await query.queryFn({ pageParam: 2 });

    expect(query.queryKey).toEqual(meQueryKeys.visitedShops());
    expect(queryMocks.getMyVisitedShops).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
    });
    expect(
      query.getNextPageParam({
        pagination: { hasNext: true, page: 2 },
      }),
    ).toBe(3);
    expect(
      query.getNextPageParam({
        pagination: { hasNext: false, page: 2 },
      }),
    ).toBeUndefined();
  });
});
