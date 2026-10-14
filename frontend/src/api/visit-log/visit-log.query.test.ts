import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  createVisitLog: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: queryMocks.useMutation,
  useQueryClient: queryMocks.useQueryClient,
}));

vi.mock("./visit-log.api", () => ({
  createVisitLog: queryMocks.createVisitLog,
}));

import { shopQueryKeys } from "../shops/shop.query";
import { useCreateVisitLog } from "./visit-log.query";

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useQueryClient.mockReturnValue({
    invalidateQueries: queryMocks.invalidateQueries,
  });
  queryMocks.useMutation.mockImplementation((options) => options);
  queryMocks.createVisitLog.mockResolvedValue({ visitLogId: "visit-log-1" });
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
