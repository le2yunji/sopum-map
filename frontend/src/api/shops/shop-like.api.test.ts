import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
}));

vi.mock("../client.js", () => ({
  apiClient: mocks.apiClient,
}));

import { getLikedShops, likeShop, unlikeShop } from "./shop-like.api.js";

describe("shop like api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("상점 좋아요 API를 호출한다", async () => {
    mocks.apiClient.mockResolvedValue({
      success: true,
      data: {
        shopId: "shop-1",
        isLiked: true,
        likeCount: 3,
      },
    });

    await likeShop("shop-1");

    expect(mocks.apiClient).toHaveBeenCalledWith("/shops/shop-1/likes", {
      method: "POST",
    });
  });

  it("상점 좋아요 취소 API를 호출한다", async () => {
    mocks.apiClient.mockResolvedValue({
      success: true,
      data: {
        shopId: "shop-1",
        isLiked: false,
        likeCount: 2,
      },
    });

    await unlikeShop("shop-1");

    expect(mocks.apiClient).toHaveBeenCalledWith("/shops/shop-1/likes", {
      method: "DELETE",
    });
  });

  it("좋아요한 상점 목록을 조회한다", async () => {
    mocks.apiClient.mockResolvedValue({
      success: true,
      data: {
        items: [],
        pagination: {
          totalCount: 0,
          page: 2,
          limit: 10,
          totalPages: 0,
          hasNext: false,
        },
      },
    });

    await getLikedShops({
      page: 2,
      limit: 10,
    });

    expect(mocks.apiClient).toHaveBeenCalledWith(
      "/me/liked-shops?page=2&limit=10",
    );
  });

  it("좋아요 목록 query가 없으면 기본 URL을 호출한다", async () => {
    mocks.apiClient.mockResolvedValue({
      success: true,
      data: {
        items: [],
        pagination: {
          totalCount: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNext: false,
        },
      },
    });

    await getLikedShops();

    expect(mocks.apiClient).toHaveBeenCalledWith("/me/liked-shops");
  });
});
