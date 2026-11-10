// src/api/shops/shop.query.ts

import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  skipToken,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type { GetShopMapQuery, GetShopsQuery } from "@sopum-map/shared";
import { getShopDetail, getShopMap, getShops } from "./shop.api";

/** 상점 관련 React Query key를 관리합니다. */
export const shopQueryKeys = {
  all: ["shops"] as const,

  lists: () => [...shopQueryKeys.all, "list"] as const,
  list: (query: GetShopsQuery) => [...shopQueryKeys.lists(), query] as const,

  maps: () => [...shopQueryKeys.all, "map"] as const,
  map: (query: GetShopMapQuery) => [...shopQueryKeys.maps(), query] as const,

  details: () => [...shopQueryKeys.all, "detail"] as const,
  detail: (shopId: string) => [...shopQueryKeys.details(), shopId] as const,
};

/** 상점 목록 조회에 재사용할 React Query 옵션을 만듭니다. */
export function createInfiniteShopsQueryOptions(
  query: Omit<GetShopsQuery, "page">,
  enabled = true,
) {
  return infiniteQueryOptions({
    queryKey: shopQueryKeys.list(query),

    queryFn: ({ pageParam }) =>
      getShops({
        ...query,
        page: pageParam,
      }),

    initialPageParam: 1,
    enabled,

    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;

      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
  });
}

/** 상점 목록을 페이지 단위로 조회합니다. */
export function useInfiniteShops(
  query: Omit<GetShopsQuery, "page">,
  enabled = true,
) {
  return useInfiniteQuery(createInfiniteShopsQueryOptions(query, enabled));
}

/** 지도 마커 조회에 재사용할 React Query 옵션을 만듭니다. */
export function createShopMapQueryOptions(
  query: GetShopMapQuery,
  enabled = true,
) {
  return queryOptions({
    queryKey: shopQueryKeys.map(query),
    queryFn: () => getShopMap(query),
    enabled,

    // 새 영역을 불러오는 동안 기존 마커를 유지합니다.
    placeholderData: keepPreviousData,
  });
}

/** 현재 지도 영역의 상점 마커를 조회합니다. */
export function useShopMap(query: GetShopMapQuery | undefined, enabled = true) {
  return useQuery({
    queryKey: query ? shopQueryKeys.map(query) : shopQueryKeys.maps(),
    queryFn: query ? () => getShopMap(query) : skipToken,
    enabled: enabled && Boolean(query),
    placeholderData: keepPreviousData,
  });
}

/** 선택된 상점 상세 정보를 조회합니다. */
export function useShopDetail(shopId?: string) {
  return useQuery({
    queryKey: shopQueryKeys.detail(shopId ?? ""),

    queryFn: () => {
      if (!shopId) {
        throw new Error("shopId가 필요합니다.");
      }

      return getShopDetail(shopId);
    },

    enabled: Boolean(shopId),
  });
}
