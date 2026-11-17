import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  aggregateVisits: vi.fn(),
  findLikedShops: vi.fn(),
  selectLikedShops: vi.fn(),
  leanLikedShops: vi.fn(),
}));

const helperMocks = vi.hoisted(() => ({
  getShopCountMaps: vi.fn(),
}));

const mapperMocks = vi.hoisted(() => ({
  mapShopListItem: vi.fn(),
}));

vi.mock("../../models/visit-log.model.js", () => ({
  default: { aggregate: modelMocks.aggregateVisits },
}));

vi.mock("../../models/course-shop-visit.model.js", () => ({
  default: { collection: { name: "courseshopvisits" } },
}));

vi.mock("../../models/shop-like.model.js", () => ({
  default: { find: modelMocks.findLikedShops },
}));

vi.mock("../shop/shop-count.helper.js", () => ({
  getShopCountMaps: helperMocks.getShopCountMaps,
}));

vi.mock("../shop/shop.mapper.js", () => ({
  mapShopListItem: mapperMocks.mapShopListItem,
}));

import {
  countMyVisitedShops,
  getMyVisitedShops,
} from "./user-visited-shop.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";

const mappedShop = {
  id: "6a8a68e15e2aa43be6a654a0",
  category: "소품샵",
  tags: [],
  name: "모모 소품샵",
  address: "서울 성동구 연무장길",
  region1: "서울",
  region2: "성동구",
  region3: null,
  regionGroup: "seongsu-seoulforest",
  latitude: 37.544,
  longitude: 127.055,
  mainImageUrl: null,
  status: "active",
  likeCount: 4,
  visitLogCount: 2,
  isLiked: true,
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findLikedShops.mockReturnValue({
    select: modelMocks.selectLikedShops,
  });
  modelMocks.selectLikedShops.mockReturnValue({
    lean: modelMocks.leanLikedShops,
  });
  modelMocks.leanLikedShops.mockResolvedValue([]);
  helperMocks.getShopCountMaps.mockResolvedValue({
    likeCountByShopId: new Map(),
    visitLogCountByShopId: new Map(),
  });
  mapperMocks.mapShopListItem.mockReturnValue(mappedShop);
});

describe("getMyVisitedShops", () => {
  it("두 방문 기록을 합치고 중복 상점의 최근 방문 시각으로 페이지를 만듭니다", async () => {
    const shopId = new Types.ObjectId(mappedShop.id);
    const lastVisitedAt = new Date("2026-11-15T03:00:00.000Z");
    const lastVisitLogAt = new Date("2026-11-07T03:00:00.000Z");

    modelMocks.aggregateVisits.mockResolvedValue([
      {
        items: [
          {
            _id: shopId,
            lastVisitedAt,
            lastVisitLogAt,
            shop: { _id: shopId },
          },
        ],
        total: [{ count: 1 }],
      },
    ]);
    modelMocks.leanLikedShops.mockResolvedValue([{ shopId }]);
    helperMocks.getShopCountMaps.mockResolvedValue({
      likeCountByShopId: new Map([[shopId.toString(), 4]]),
      visitLogCountByShopId: new Map([[shopId.toString(), 2]]),
    });

    await expect(
      getMyVisitedShops({ userId, page: 2, limit: 5 }),
    ).resolves.toEqual({
      items: [
        {
          ...mappedShop,
          lastVisitedAt: "2026-11-15T03:00:00.000Z",
          lastVisitLogAt: "2026-11-07T03:00:00.000Z",
        },
      ],
      pagination: {
        totalCount: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
        hasNext: false,
      },
    });

    expect(mapperMocks.mapShopListItem).toHaveBeenCalledWith({
      shop: { _id: shopId },
      likeCount: 4,
      visitLogCount: 2,
      isLiked: true,
    });
  });

  it("활성 로그와 코스 방문을 합친 뒤 활성 상점만 최신순으로 조회합니다", async () => {
    modelMocks.aggregateVisits.mockResolvedValue([
      { items: [], total: [] },
    ]);

    await getMyVisitedShops({ userId, page: 2, limit: 5 });

    const pipeline = modelMocks.aggregateVisits.mock.calls[0]?.[0];
    const objectUserId = new Types.ObjectId(userId);

    expect(pipeline).toEqual(
      expect.arrayContaining([
        { $match: { userId: objectUserId, status: "active" } },
        {
          $project: {
            _id: 0,
            shopId: 1,
            lastVisitedAt: "$visitedAt",
            lastVisitLogAt: "$visitedAt",
          },
        },
        expect.objectContaining({
          $unionWith: expect.objectContaining({
            coll: "courseshopvisits",
            pipeline: expect.arrayContaining([
              { $match: { userId: objectUserId } },
              {
                $project: {
                  _id: 0,
                  shopId: 1,
                  lastVisitedAt: "$createdAt",
                  lastVisitLogAt: { $literal: null },
                },
              },
            ]),
          }),
        }),
        {
          $group: {
            _id: "$shopId",
            lastVisitedAt: { $max: "$lastVisitedAt" },
            lastVisitLogAt: { $max: "$lastVisitLogAt" },
          },
        },
        { $match: { "shop.status": "active" } },
        { $sort: { lastVisitedAt: -1, _id: -1 } },
        {
          $facet: {
            items: [{ $skip: 5 }, { $limit: 5 }],
            total: [{ $count: "count" }],
          },
        },
      ]),
    );
  });
});

describe("countMyVisitedShops", () => {
  it("목록과 같은 기준으로 활성 방문 상점 수를 계산합니다", async () => {
    modelMocks.aggregateVisits.mockResolvedValue([{ count: 3 }]);

    await expect(countMyVisitedShops(userId)).resolves.toBe(3);

    const pipeline = modelMocks.aggregateVisits.mock.calls[0]?.[0];
    const objectUserId = new Types.ObjectId(userId);

    expect(pipeline).toEqual(
      expect.arrayContaining([
        { $match: { userId: objectUserId, status: "active" } },
        expect.objectContaining({
          $unionWith: expect.objectContaining({
            coll: "courseshopvisits",
            pipeline: expect.arrayContaining([
              { $match: { userId: objectUserId } },
            ]),
          }),
        }),
        {
          $group: {
            _id: "$shopId",
            lastVisitedAt: { $max: "$lastVisitedAt" },
            lastVisitLogAt: { $max: "$lastVisitLogAt" },
          },
        },
        { $match: { "shop.status": "active" } },
      ]),
    );
    expect(pipeline.at(-1)).toEqual({ $count: "count" });
  });
});
