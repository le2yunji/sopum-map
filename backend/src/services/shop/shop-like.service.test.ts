import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findLikes: vi.fn(),
  sortLikes: vi.fn(),
  skipLikes: vi.fn(),
  limitLikes: vi.fn(),
  countLikes: vi.fn(),
  updateLike: vi.fn(),
  deleteLike: vi.fn(),
  existsShop: vi.fn(),
  findFolders: vi.fn(),
  selectFolders: vi.fn(),
  leanFolders: vi.fn(),
  deleteFolderItems: vi.fn(),
  getShopMapByIds: vi.fn(),
  getShopCountMaps: vi.fn(),
  mapShopListItem: vi.fn(),
}));

vi.mock("../../models/shop-like.model.js", () => ({
  default: {
    find: modelMocks.findLikes,
    countDocuments: modelMocks.countLikes,
    updateOne: modelMocks.updateLike,
    deleteOne: modelMocks.deleteLike,
  },
}));

vi.mock("../../models/shop.model.js", () => ({
  default: {
    exists: modelMocks.existsShop,
  },
}));

vi.mock("../../models/pick-folder.model.js", () => ({
  default: {
    find: modelMocks.findFolders,
  },
}));

vi.mock("../../models/pick-folder-item.model.js", () => ({
  default: {
    deleteMany: modelMocks.deleteFolderItems,
  },
}));

vi.mock("./shop-query.helper.js", () => ({
  getShopMapByIds: modelMocks.getShopMapByIds,
}));

vi.mock("./shop-count.helper.js", () => ({
  getShopCountMaps: modelMocks.getShopCountMaps,
}));

vi.mock("./shop.mapper.js", () => ({
  mapShopListItem: modelMocks.mapShopListItem,
}));

import {
  getLikedShops,
  likeShop,
  unlikeShop,
} from "./shop-like.service.js";

describe("shop like service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    modelMocks.findLikes.mockReturnValue({ sort: modelMocks.sortLikes });
    modelMocks.sortLikes.mockReturnValue({ skip: modelMocks.skipLikes });
    modelMocks.skipLikes.mockReturnValue({ limit: modelMocks.limitLikes });
    modelMocks.countLikes.mockResolvedValue(1);
    modelMocks.updateLike.mockResolvedValue({ upsertedCount: 1 });
    modelMocks.deleteLike.mockResolvedValue({ deletedCount: 1 });
    modelMocks.existsShop.mockResolvedValue({ _id: new Types.ObjectId() });
    modelMocks.findFolders.mockReturnValue({
      select: modelMocks.selectFolders,
    });
    modelMocks.selectFolders.mockReturnValue({
      lean: modelMocks.leanFolders,
    });
    modelMocks.leanFolders.mockResolvedValue([]);
    modelMocks.deleteFolderItems.mockResolvedValue({ deletedCount: 0 });
    modelMocks.getShopCountMaps.mockResolvedValue({
      likeCountByShopId: new Map(),
      visitLogCountByShopId: new Map(),
    });
    modelMocks.mapShopListItem.mockImplementation(
      ({ shop, likeCount, visitLogCount, isLiked }) => ({
        id: shop._id.toString(),
        likeCount,
        visitLogCount,
        isLiked,
      }),
    );
  });

  describe("좋아요 변경", () => {
    it("좋아요 추가 뒤 실제 좋아요 수를 반환한다", async () => {
      const shopId = new Types.ObjectId().toString();
      modelMocks.countLikes.mockResolvedValue(7);

      await expect(likeShop(new Types.ObjectId().toString(), shopId)).resolves
        .toEqual({
          shopId,
          isLiked: true,
          likeCount: 7,
        });
    });

    it("좋아요 취소 뒤 실제 좋아요 수를 반환한다", async () => {
      const shopId = new Types.ObjectId().toString();
      modelMocks.countLikes.mockResolvedValue(6);

      await expect(unlikeShop(new Types.ObjectId().toString(), shopId)).resolves
        .toEqual({
          shopId,
          isLiked: false,
          likeCount: 6,
        });
    });
  });

  describe("좋아요한 상점 목록", () => {
    it("실제 좋아요와 활성 방문 로그 수를 반환한다", async () => {
      const shopId = new Types.ObjectId("64b000000000000000000001");
      const likedAt = new Date("2026-11-01T00:00:00.000Z");

      modelMocks.limitLikes.mockResolvedValue([
        { shopId, createdAt: likedAt },
      ]);
      modelMocks.getShopMapByIds.mockResolvedValue(
        new Map([[shopId.toString(), { _id: shopId }]]),
      );
      modelMocks.getShopCountMaps.mockResolvedValue({
        likeCountByShopId: new Map([[shopId.toString(), 7]]),
        visitLogCountByShopId: new Map([[shopId.toString(), 3]]),
      });

      const result = await getLikedShops({
        userId: new Types.ObjectId().toString(),
        page: 1,
        limit: 20,
      });

      expect(result.items[0]).toMatchObject({
        id: shopId.toString(),
        likeCount: 7,
        visitLogCount: 3,
        isLiked: true,
        likedAt: likedAt.toISOString(),
      });
      expect(modelMocks.getShopCountMaps).toHaveBeenCalledWith([shopId]);
    });
  });
});
