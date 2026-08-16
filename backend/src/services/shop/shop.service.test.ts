import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  aggregateShops: vi.fn(),
  findOneShop: vi.fn(),
  aggregateVisitLogs: vi.fn(),
  countVisitLogs: vi.fn(),
  findLikes: vi.fn(),
}));

vi.mock("../../models/shop.model", () => ({
  default: {
    aggregate: modelMocks.aggregateShops,
    findOne: modelMocks.findOneShop,
  },
}));

vi.mock("../../models/visit-log.model", () => ({
  default: {
    aggregate: modelMocks.aggregateVisitLogs,
    countDocuments: modelMocks.countVisitLogs,
  },
}));

vi.mock("../../models/like.model", () => ({
  default: {
    find: modelMocks.findLikes,
  },
}));

import { getShopById, getShops } from "./shop.service";

const shopId = new Types.ObjectId("64b000000000000000000001");
const userId = new Types.ObjectId("64b000000000000000000002");

const shopDocument = {
  _id: shopId,
  category: "소품샵" as const,
  tagStats: [
    {
      key: "cute" as const,
      count: 3,
    },
  ],
  name: "초록 서랍",
  address: "서울특별시 마포구 연남동 1",
  region1: "서울특별시",
  region2: "마포구",
  region3: "연남동",
  location: {
    type: "Point" as const,
    coordinates: [126.92, 37.56],
  },
  phone: "02-123-4567",
  description: "작은 소품 가게",
  openingHours: "매일 11:00-20:00",
  instagramUrl: null,
  naverMapUrl: null,
  images: [
    {
      imageUrl: "https://example.com/second.webp",
      altText: "두 번째 이미지",
      sourceUrl: null,
      sourceType: "official" as const,
      isMain: false,
      order: 2,
    },
    {
      imageUrl: "https://example.com/main.webp",
      altText: "대표 이미지",
      sourceUrl: null,
      sourceType: "official" as const,
      isMain: true,
      order: 1,
    },
  ],
  sourceType: "admin" as const,
  likeCount: 4,
  status: "active" as const,
  createdAt: new Date("2026-08-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-02T00:00:00.000Z"),
  distance: 125.6,
};

describe("shop service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("빈 목록의 페이지 정보를 반환하고 추가 조회를 생략한다", async () => {
    modelMocks.aggregateShops.mockResolvedValue([{ items: [], metadata: [] }]);

    const result = await getShops({
      page: 1,
      limit: 20,
      sort: "latest",
    });

    expect(result).toEqual({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
      },
    });
    expect(modelMocks.aggregateVisitLogs).not.toHaveBeenCalled();
    expect(modelMocks.findLikes).not.toHaveBeenCalled();
  });

  it("방문 횟수와 로그인 사용자의 좋아요 여부를 목록에 합친다", async () => {
    modelMocks.aggregateShops.mockResolvedValue([
      {
        items: [shopDocument],
        metadata: [{ totalCount: 21 }],
      },
    ]);
    modelMocks.aggregateVisitLogs.mockResolvedValue([
      { _id: shopId, count: 3 },
    ]);
    modelMocks.findLikes.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([{ shopId }]),
      }),
    });

    const result = await getShops({
      page: 1,
      limit: 20,
      sort: "distance",
      lat: 37.56,
      lng: 126.92,
      userId: userId.toString(),
    });

    expect(result.items[0]).toMatchObject({
      id: shopId.toString(),
      name: "초록 서랍",
      mainImageUrl: "https://example.com/main.webp",
      visitLogCount: 3,
      isLiked: true,
      tags: [{ key: "cute", count: 3 }],
      distance: 126,
    });
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      totalCount: 21,
      totalPages: 2,
      hasNext: true,
    });
  });

  it("잘못된 상점 ID를 데이터베이스 조회 전에 거부한다", async () => {
    await expect(getShopById("not-an-object-id")).rejects.toMatchObject({
      status: 400,
      code: "INVALID_PARAMETER",
      details: {
        shopId: "shopId 값이 올바른 ObjectId 형식이 아닙니다.",
      },
    });
    expect(modelMocks.findOneShop).not.toHaveBeenCalled();
  });

  it("활성 상점이 없으면 SHOP_NOT_FOUND 오류를 반환한다", async () => {
    modelMocks.findOneShop.mockReturnValue({
      lean: () => Promise.resolve(null),
    });

    await expect(getShopById(shopId.toString())).rejects.toMatchObject({
      status: 404,
      code: "SHOP_NOT_FOUND",
    });
  });

  it("상세 이미지 순서와 방문 횟수를 API 형식으로 변환한다", async () => {
    modelMocks.findOneShop.mockReturnValue({
      lean: () => Promise.resolve(shopDocument),
    });
    modelMocks.countVisitLogs.mockResolvedValue(7);
    modelMocks.findLikes.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([{ shopId }]),
      }),
    });

    const result = await getShopById(shopId.toString(), userId.toString());

    expect(result).toMatchObject({
      id: shopId.toString(),
      latitude: 37.56,
      longitude: 126.92,
      visitLogCount: 7,
      isLiked: true,
      tags: [{ key: "cute", count: 3 }],
      createdAt: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-08-02T00:00:00.000Z",
    });
    expect(result.images.map((image) => image.order)).toEqual([1, 2]);
  });
});
