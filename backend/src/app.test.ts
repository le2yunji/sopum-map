import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "./app.js";

const serviceMocks = vi.hoisted(() => {
  process.env.MONGODB_URI = "mongodb://localhost:27017/sopum-map-test";

  return {
    getShops: vi.fn(),
    getShopMap: vi.fn(),
    getShopById: vi.fn(),
  };
});

vi.mock("./services/shop/shop.service.js", () => serviceMocks);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("shop API", () => {
  it("검증된 상점 목록을 공통 성공 형식으로 반환한다", async () => {
    serviceMocks.getShops.mockResolvedValue({
      items: [],
      pagination: {
        page: 2,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
      },
    });

    const response = await request(app)
      .get("/api/shops")
      .query({ page: "2", limit: "10" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [],
        pagination: {
          page: 2,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
        },
      },
    });
    expect(serviceMocks.getShops).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      sort: "latest",
      userId: undefined,
    });
  });

  it("위도만 전달하면 공통 검증 오류 형식으로 반환한다", async () => {
    const response = await request(app)
      .get("/api/shops")
      .query({ lat: "37.5" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "요청 데이터 형식이 올바르지 않습니다.",
        details: {
          location: "lat와 lng는 함께 전달해야 합니다.",
        },
      },
    });
    expect(serviceMocks.getShops).not.toHaveBeenCalled();
  });

  it("검증된 지도 경계로 상점 마커를 조회한다", async () => {
    serviceMocks.getShopMap.mockResolvedValue({
      items: [
        {
          id: "64b000000000000000000001",
          name: "소품 상점",
          latitude: 37.55,
          longitude: 127.05,
          isLiked: false,
        },
      ],
      isTruncated: false,
    });

    const response = await request(app).get("/api/shops/map").query({
      southWestLat: "37.5",
      southWestLng: "126.9",
      northEastLat: "37.6",
      northEastLng: "127.1",
      keyword: "  소품  ",
      tagKeys: ["cute", "interior"],
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [
          {
            id: "64b000000000000000000001",
            name: "소품 상점",
            latitude: 37.55,
            longitude: 127.05,
            isLiked: false,
          },
        ],
        isTruncated: false,
      },
    });
    expect(serviceMocks.getShopMap).toHaveBeenCalledWith({
      bounds: {
        southWestLat: 37.5,
        southWestLng: 126.9,
        northEastLat: 37.6,
        northEastLng: 127.1,
      },
      keyword: "소품",
      tagKeys: ["cute", "interior"],
      userId: undefined,
    });
    expect(serviceMocks.getShopById).not.toHaveBeenCalled();
  });

  it("지도 경계가 빠진 마커 조회 요청을 서비스 호출 전에 거부한다", async () => {
    const response = await request(app).get("/api/shops/map").query({
      southWestLat: "37.5",
      southWestLng: "126.9",
      northEastLat: "37.6",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "요청 데이터 형식이 올바르지 않습니다.",
      },
    });
    expect(serviceMocks.getShopMap).not.toHaveBeenCalled();
    expect(serviceMocks.getShopById).not.toHaveBeenCalled();
  });
});
