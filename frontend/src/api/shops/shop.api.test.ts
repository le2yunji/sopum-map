import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
}));

vi.mock("../client", () => ({
  apiClient: mocks.apiClient,
}));

import { createShopsSearchParams, getShopMap } from "./shop.api";

const bounds = {
  southWestLat: 37.5,
  southWestLng: 126.9,
  northEastLat: 37.6,
  northEastLng: 127.1,
} as const;

describe("shop api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("상점 목록의 지도 경계와 필터를 query string으로 변환한다", () => {
    const searchParams = createShopsSearchParams({
      bounds,
      keyword: "소품",
      tagKeys: ["cute", "interior"],
    });

    expect(searchParams.get("southWestLat")).toBe("37.5");
    expect(searchParams.get("southWestLng")).toBe("126.9");
    expect(searchParams.get("northEastLat")).toBe("37.6");
    expect(searchParams.get("northEastLng")).toBe("127.1");
    expect(searchParams.get("keyword")).toBe("소품");
    expect(searchParams.getAll("tagKeys")).toEqual(["cute", "interior"]);
  });

  it("지도 경계와 필터로 마커 API를 호출한다", async () => {
    mocks.apiClient.mockResolvedValue({
      items: [],
      isTruncated: false,
    });

    await getShopMap({
      bounds,
      keyword: "소품",
      tagKeys: ["cute", "interior"],
    });

    const [requestPath] = mocks.apiClient.mock.calls[0] as [string];
    const [pathname, queryString] = requestPath.split("?");
    const searchParams = new URLSearchParams(queryString);

    expect(pathname).toBe("/shops/map");
    expect(searchParams.get("southWestLat")).toBe("37.5");
    expect(searchParams.get("southWestLng")).toBe("126.9");
    expect(searchParams.get("northEastLat")).toBe("37.6");
    expect(searchParams.get("northEastLng")).toBe("127.1");
    expect(searchParams.get("keyword")).toBe("소품");
    expect(searchParams.getAll("tagKeys")).toEqual(["cute", "interior"]);
  });
});
