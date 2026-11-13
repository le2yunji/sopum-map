import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  existsFolder: vi.fn(),
  findFolderItems: vi.fn(),
  sortFolderItems: vi.fn(),
  skipFolderItems: vi.fn(),
  limitFolderItems: vi.fn(),
  leanFolderItems: vi.fn(),
  countFolderItems: vi.fn(),
  getShopMapByIds: vi.fn(),
  getShopCountMaps: vi.fn(),
  mapShopListItem: vi.fn(),
}));

vi.mock("../../models/pick-folder.model.js", () => ({
  default: {
    exists: modelMocks.existsFolder,
  },
}));

vi.mock("../../models/pick-folder-item.model.js", () => ({
  default: {
    find: modelMocks.findFolderItems,
    countDocuments: modelMocks.countFolderItems,
  },
}));

vi.mock("../shop/shop-query.helper.js", () => ({
  getShopMapByIds: modelMocks.getShopMapByIds,
}));

vi.mock("../shop/shop-count.helper.js", () => ({
  getShopCountMaps: modelMocks.getShopCountMaps,
}));

vi.mock("../shop/shop.mapper.js", () => ({
  mapShopListItem: modelMocks.mapShopListItem,
}));

import { getShopsByFolder } from "./pick-folder.service.js";

describe("getShopsByFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    modelMocks.existsFolder.mockResolvedValue({ _id: new Types.ObjectId() });
    modelMocks.findFolderItems.mockReturnValue({
      sort: modelMocks.sortFolderItems,
    });
    modelMocks.sortFolderItems.mockReturnValue({
      skip: modelMocks.skipFolderItems,
    });
    modelMocks.skipFolderItems.mockReturnValue({
      limit: modelMocks.limitFolderItems,
    });
    modelMocks.limitFolderItems.mockReturnValue({
      lean: modelMocks.leanFolderItems,
    });
    modelMocks.countFolderItems.mockResolvedValue(1);
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

  it("폴더 상점의 실제 좋아요와 활성 방문 로그 수를 반환한다", async () => {
    const shopId = new Types.ObjectId("64b000000000000000000001");

    modelMocks.leanFolderItems.mockResolvedValue([{ shopId }]);
    modelMocks.getShopMapByIds.mockResolvedValue(
      new Map([[shopId.toString(), { _id: shopId }]]),
    );
    modelMocks.getShopCountMaps.mockResolvedValue({
      likeCountByShopId: new Map([[shopId.toString(), 7]]),
      visitLogCountByShopId: new Map([[shopId.toString(), 3]]),
    });

    const result = await getShopsByFolder({
      userId: new Types.ObjectId().toString(),
      folderId: new Types.ObjectId().toString(),
      page: 1,
      limit: 20,
    });

    expect(result.items[0]).toMatchObject({
      id: shopId.toString(),
      likeCount: 7,
      visitLogCount: 3,
      isLiked: true,
    });
    expect(modelMocks.getShopCountMaps).toHaveBeenCalledWith([shopId]);
  });
});
