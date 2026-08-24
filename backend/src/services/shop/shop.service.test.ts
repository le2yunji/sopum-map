import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  aggregateShops: vi.fn(),
  findOneShop: vi.fn(),
}));

vi.mock("../../models/shop.model", () => ({
  default: {
    aggregate: modelMocks.aggregateShops,
    findOne: modelMocks.findOneShop,
  },
}));

import { getShopById, getShops } from "./shop.service";

const shopId = new Types.ObjectId("64b000000000000000000001");

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

        /**
         * 아직 사용자 기능 연결 전
         */
        visitLogCount: 0,
        isLiked: false,

        /**
         * mapShopListItem에서
         * Math.round()를 적용하고 있음
         */
        distance: 126,
      });

      expect(result.pagination).toEqual({
        totalCount: 21,

        page: 1,
        limit: 20,

        totalPages: 2,

        hasNext: true,
      });
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
    it("활성 상점이 없으면 오류를 반환한다", async () => {
      modelMocks.findOneShop.mockReturnValue({
        lean: () => Promise.resolve(null),
      });

      await expect(getShopById(shopId.toString())).rejects.toThrow(
        "상점을 찾을 수 없습니다.",
      );
    });

    it("상점 상세 정보를 API 형식으로 변환한다", async () => {
      modelMocks.findOneShop.mockReturnValue({
        lean: () => Promise.resolve(shopDocument),
      });

      const result = await getShopById(shopId.toString());

      expect(result).toMatchObject({
        id: shopId.toString(),

        category: "소품샵",

        name: "초록 서랍",

        latitude: 37.56,
        longitude: 126.92,

        tags: [
          {
            key: "cute",
            count: 3,
          },
        ],

        /**
         * 사용자 기능 연결 전 기본값
         */
        visitLogCount: 0,
        isLiked: false,

        createdAt: "2026-08-01T00:00:00.000Z",

        updatedAt: "2026-08-02T00:00:00.000Z",
      });
    });

    it("상세 이미지를 order 순서로 반환한다", async () => {
      modelMocks.findOneShop.mockReturnValue({
        lean: () => Promise.resolve(shopDocument),
      });

      const result = await getShopById(shopId.toString());

      expect(result.images.map((image) => image.order)).toEqual([1, 2]);
    });
  });
});
