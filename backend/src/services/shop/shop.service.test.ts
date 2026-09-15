import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  aggregateShops: vi.fn(),
  findOneShop: vi.fn(),

  distinctLikedShopIds: vi.fn(),
  existsShopLike: vi.fn(),
}));

vi.mock("../../models/shop.model.js", () => ({
  default: {
    aggregate: modelMocks.aggregateShops,
    findOne: modelMocks.findOneShop,
  },
}));

vi.mock("../../models/shop-like.model.js", () => ({
  default: {
    distinct: modelMocks.distinctLikedShopIds,
    exists: modelMocks.existsShopLike,
  },
}));

import { getShopById, getShops } from "./shop.service.js";

const shopId = new Types.ObjectId("64b000000000000000000001");

const userId = new Types.ObjectId("64b000000000000000000002").toString();

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

  businessHours: [
    {
      day: "monday",
      isClosed: false,
      periods: [
        {
          open: "11:00",
          close: "20:00",
        },
      ],
    },
    {
      day: "tuesday",
      isClosed: true,
      periods: [],
    },
  ],
  businessHoursNote: "공휴일 영업시간 변동",

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

    /**
     * 기본적으로 좋아요가 없는 상태로 시작한다.
     */
    modelMocks.distinctLikedShopIds.mockResolvedValue([]);
    modelMocks.existsShopLike.mockResolvedValue(null);
  });

  describe("getShops", () => {
    it("빈 목록이면 빈 items와 pagination 정보를 반환한다", async () => {
      modelMocks.aggregateShops.mockResolvedValue([
        {
          items: [],
          count: [],
        },
      ]);

      const result = await getShops({
        page: 1,
        limit: 20,
        sort: "latest",
      });

      expect(result).toEqual({
        items: [],

        pagination: {
          totalCount: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNext: false,
        },
      });

      /**
       * 비로그인 사용자이므로
       * ShopLike 조회를 수행하지 않는다.
       */
      expect(modelMocks.distinctLikedShopIds).not.toHaveBeenCalled();
    });

    it("Shop 조회 결과를 목록 API 형식으로 변환한다", async () => {
      modelMocks.aggregateShops.mockResolvedValue([
        {
          items: [shopDocument],

          count: [
            {
              totalCount: 21,
            },
          ],
        },
      ]);

      const result = await getShops({
        page: 1,
        limit: 20,

        sort: "distance",

        lat: 37.56,
        lng: 126.92,
      });

      expect(result.items[0]).toMatchObject({
        id: shopId.toString(),

        name: "초록 서랍",

        latitude: 37.56,
        longitude: 126.92,

        mainImageUrl: "https://example.com/main.webp",

        tags: [
          {
            key: "cute",
            count: 3,
          },
        ],

        visitLogCount: 0,
        isLiked: false,

        /**
         * mapShopListItem에서
         * Math.round()를 적용한다.
         */
        distanceMeters: 126,
      });

      expect(result.pagination).toEqual({
        totalCount: 21,

        page: 1,
        limit: 20,

        totalPages: 2,

        hasNext: true,
      });
    });

    it("로그인 사용자가 좋아요한 Shop이면 isLiked가 true다", async () => {
      modelMocks.aggregateShops.mockResolvedValue([
        {
          items: [shopDocument],

          count: [
            {
              totalCount: 1,
            },
          ],
        },
      ]);

      modelMocks.distinctLikedShopIds.mockResolvedValue([shopId]);

      const result = await getShops({
        page: 1,
        limit: 20,
        sort: "latest",
        userId,
      });

      expect(result.items[0]?.isLiked).toBe(true);

      expect(modelMocks.distinctLikedShopIds).toHaveBeenCalledWith("shopId", {
        userId,
        shopId: {
          $in: [shopId],
        },
      });
    });

    it("로그인 사용자라도 좋아요하지 않은 Shop이면 isLiked가 false다", async () => {
      modelMocks.aggregateShops.mockResolvedValue([
        {
          items: [shopDocument],

          count: [
            {
              totalCount: 1,
            },
          ],
        },
      ]);

      modelMocks.distinctLikedShopIds.mockResolvedValue([]);

      const result = await getShops({
        page: 1,
        limit: 20,
        sort: "latest",
        userId,
      });

      expect(result.items[0]?.isLiked).toBe(false);
    });

    it("현재 페이지가 마지막 페이지이면 hasNext가 false다", async () => {
      modelMocks.aggregateShops.mockResolvedValue([
        {
          items: [],

          count: [
            {
              totalCount: 21,
            },
          ],
        },
      ]);

      const result = await getShops({
        page: 2,
        limit: 20,
        sort: "latest",
      });

      expect(result.pagination).toEqual({
        totalCount: 21,

        page: 2,
        limit: 20,

        totalPages: 2,

        hasNext: false,
      });
    });
  });

  describe("getShopById", () => {
    it("상점이 없으면 오류를 반환한다", async () => {
      modelMocks.findOneShop.mockResolvedValue(null);

      await expect(
        getShopById({
          shopId: shopId.toString(),
        }),
      ).rejects.toThrow("상점을 찾을 수 없습니다.");

      expect(modelMocks.existsShopLike).not.toHaveBeenCalled();
    });

    it("비로그인 사용자의 상점 상세는 isLiked가 false다", async () => {
      modelMocks.findOneShop.mockResolvedValue(shopDocument);

      const result = await getShopById({
        shopId: shopId.toString(),
      });

      expect(modelMocks.findOneShop).toHaveBeenCalledWith({
        _id: shopId.toString(),
        status: "active",
      });

      expect(result.isLiked).toBe(false);

      expect(modelMocks.existsShopLike).not.toHaveBeenCalled();
    });

    it("로그인 사용자가 좋아요한 상점 상세는 isLiked가 true다", async () => {
      modelMocks.findOneShop.mockResolvedValue(shopDocument);

      modelMocks.existsShopLike.mockResolvedValue({
        _id: new Types.ObjectId(),
      });

      const result = await getShopById({
        shopId: shopId.toString(),
        userId,
      });

      expect(result.isLiked).toBe(true);

      expect(modelMocks.existsShopLike).toHaveBeenCalledWith({
        userId,
        shopId,
      });
    });

    it("로그인 사용자가 좋아요하지 않은 상점 상세는 isLiked가 false다", async () => {
      modelMocks.findOneShop.mockResolvedValue(shopDocument);

      modelMocks.existsShopLike.mockResolvedValue(null);

      const result = await getShopById({
        shopId: shopId.toString(),
        userId,
      });

      expect(result.isLiked).toBe(false);
    });

    it("상세 이미지를 order 순서로 반환한다", async () => {
      modelMocks.findOneShop.mockResolvedValue(shopDocument);

      const result = await getShopById({
        shopId: shopId.toString(),
      });

      expect(result.images.map((image) => image.order)).toEqual([1, 2]);
    });

    it("상세 대표 이미지는 order보다 isMain을 우선한다", async () => {
      modelMocks.findOneShop.mockResolvedValue({
        ...shopDocument,

        images: [
          {
            ...shopDocument.images[0],
            order: 1,
          },

          {
            ...shopDocument.images[1],
            order: 2,
          },
        ],
      });

      const result = await getShopById({
        shopId: shopId.toString(),
      });

      expect(result.mainImageUrl).toBe("https://example.com/main.webp");
    });
  });
});
