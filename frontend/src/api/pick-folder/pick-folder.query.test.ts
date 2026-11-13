import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  useInfiniteQuery: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: queryMocks.useInfiniteQuery,
  useMutation: queryMocks.useMutation,
  useQuery: queryMocks.useQuery,
  useQueryClient: queryMocks.useQueryClient,
}));

import { usePickFolders } from "./pick-folder.query";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePickFolders", () => {
  it("비활성화된 화면에서는 내 픽 폴더를 조회하지 않는다", () => {
    usePickFolders(false);

    expect(queryMocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });
});
