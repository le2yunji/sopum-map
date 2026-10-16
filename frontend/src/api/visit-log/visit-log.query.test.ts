import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useInfiniteQuery: vi.fn(),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  createVisitLog: vi.fn(),
  getMyVisitLogs: vi.fn(),
  getMyVisitLog: vi.fn(),
  updateVisitLog: vi.fn(),
  deleteVisitLog: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: queryMocks.useMutation,
  useInfiniteQuery: queryMocks.useInfiniteQuery,
  useQuery: queryMocks.useQuery,
  useQueryClient: queryMocks.useQueryClient,
}));

vi.mock("./visit-log.api", () => ({
  createVisitLog: queryMocks.createVisitLog,
  getMyVisitLogs: queryMocks.getMyVisitLogs,
  getMyVisitLog: queryMocks.getMyVisitLog,
  updateVisitLog: queryMocks.updateVisitLog,
  deleteVisitLog: queryMocks.deleteVisitLog,
}));

import { shopQueryKeys } from "../shops/shop.query";
import {
  visitLogKeys,
  useDeleteVisitLog,
  useInfiniteMyVisitLogs,
} from "./visit-log.query";
import { useCreateVisitLog } from "./visit-log.query";

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useQueryClient.mockReturnValue({
    invalidateQueries: queryMocks.invalidateQueries,
  });
  queryMocks.useMutation.mockImplementation((options) => options);
  queryMocks.useInfiniteQuery.mockImplementation((options) => options);
  queryMocks.createVisitLog.mockResolvedValue({ visitLogId: "visit-log-1" });
});

describe("내 방문 로그 query", () => {
  it("다음 페이지 번호로 내 목록을 이어서 조회한다", async () => {
    const query = useInfiniteMyVisitLogs() as unknown as {
      queryFn: (context: { pageParam: number }) => Promise<unknown>;
      getNextPageParam: (page: { pagination: { hasNext: boolean; page: number } }) => number | undefined;
    };
    await query.queryFn({ pageParam: 2 });
    expect(queryMocks.getMyVisitLogs).toHaveBeenCalledWith({ page: 2, limit: 10 });
    expect(query.getNextPageParam({ pagination: { hasNext: true, page: 2 } })).toBe(3);
  });

  it("삭제 성공 후 내 목록과 상점 캐시를 갱신한다", async () => {
    const mutation = useDeleteVisitLog() as unknown as { onSuccess: () => Promise<void> };
    await mutation.onSuccess();
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: visitLogKeys.myLists() });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: shopQueryKeys.all });
  });
});

describe("useCreateVisitLog", () => {
  it("고정된 상점 ID와 입력값으로 작성 API를 호출한다", async () => {
    const mutation = useCreateVisitLog("shop-1") as unknown as {
      mutationFn: (input: {
        visitedAt: string;
        selectedTagKeys: readonly ["cute"];
        imageKeys: readonly [];
      }) => Promise<unknown>;
    };
    const input = {
      visitedAt: "2026-10-13T03:00:00.000Z",
      selectedTagKeys: ["cute"],
      imageKeys: [],
    } as const;

    await mutation.mutationFn(input);

    expect(queryMocks.createVisitLog).toHaveBeenCalledWith("shop-1", input);
  });

  it("작성 성공 후 상점 상세 캐시를 갱신한다", async () => {
    const mutation = useCreateVisitLog("shop-1") as unknown as {
      onSuccess: () => Promise<void>;
    };

    await mutation.onSuccess();

    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: shopQueryKeys.detail("shop-1"),
    });
  });
});
