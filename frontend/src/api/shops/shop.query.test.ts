import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  infiniteQueryOptions: vi.fn((options: unknown) => options),
  keepPreviousData: vi.fn((previousData: unknown) => previousData),
  queryOptions: vi.fn((options: unknown) => options),
  useInfiniteQuery: vi.fn(),
  useQuery: vi.fn(),
  getShops: vi.fn(),
  getShopMap: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  infiniteQueryOptions: queryMocks.infiniteQueryOptions,
  keepPreviousData: queryMocks.keepPreviousData,
  queryOptions: queryMocks.queryOptions,
  useInfiniteQuery: queryMocks.useInfiniteQuery,
  useQuery: queryMocks.useQuery,
}));

vi.mock("./shop.api", () => ({
  getShopDetail: vi.fn(),
  getShops: queryMocks.getShops,
  getShopMap: queryMocks.getShopMap,
}));

import {
  createInfiniteShopsQueryOptions,
  createShopMapQueryOptions,
  shopQueryKeys,
  useShopMap,
} from "./shop.query";

const bounds = {
  southWestLat: 37.5,
  southWestLng: 126.9,
  northEastLat: 37.6,
  northEastLng: 127.1,
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useInfiniteQuery.mockImplementation((options) => options);
  queryMocks.useQuery.mockImplementation((options) => options);
});

describe("shop query", () => {
  it("상점 목록과 지도 마커에 서로 다른 query key를 사용한다", () => {
    const query = {
      bounds,
      keyword: "소품",
      tagKeys: ["cute" as const],
    };

    expect(shopQueryKeys.map(query)).not.toEqual(shopQueryKeys.list(query));
  });

  it("지도 경계가 달라지면 마커 query key도 달라진다", () => {
    const firstQuery = { bounds };
    const movedQuery = {
      bounds: {
        ...bounds,
        northEastLat: 37.7,
      },
    };

    expect(shopQueryKeys.map(firstQuery)).not.toEqual(
      shopQueryKeys.map(movedQuery),
    );
  });

  it("상점 목록의 다음 페이지를 같은 검색 조건으로 조회한다", async () => {
    const query = {
      bounds,
      keyword: "소품",
      limit: 10,
      sort: "latest" as const,
    };
    const options = createInfiniteShopsQueryOptions(query);

    await (
      options.queryFn as (context: { pageParam: number }) => Promise<unknown>
    )({ pageParam: 2 });

    expect(queryMocks.getShops).toHaveBeenCalledWith({
      ...query,
      page: 2,
    });
  });

  it("마커 재조회 중 이전 데이터를 유지하는 옵션을 사용한다", async () => {
    const query = {
      bounds,
      keyword: "소품",
    };
    const options = createShopMapQueryOptions(query, true);

    await (options.queryFn as () => Promise<unknown>)();

    expect(options).toMatchObject({
      queryKey: shopQueryKeys.map(query),
      enabled: true,
      placeholderData: queryMocks.keepPreviousData,
    });
    expect(queryMocks.getShopMap).toHaveBeenCalledWith(query);
  });

  it("마커 훅이 재사용 가능한 query 옵션을 사용한다", () => {
    const query = { bounds };

    useShopMap(query, false);

    expect(queryMocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: shopQueryKeys.map(query),
        enabled: false,
        placeholderData: queryMocks.keepPreviousData,
      }),
    );
  });
});
