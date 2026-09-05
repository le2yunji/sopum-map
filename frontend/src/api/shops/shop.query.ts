// src/api/shops/shop.query.ts

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { GetShopsQuery } from "@sopum-map/shared";
import { getShopDetail, getShops } from "./shop.api";

/** 상점 관련 React Query key를 관리합니다. */
export const shopQueryKeys = {
  all: ["shops"] as const,
  lists: () => [...shopQueryKeys.all, "list"] as const,
  list: (query: GetShopsQuery) => [...shopQueryKeys.lists(), query] as const,
  details: () => [...shopQueryKeys.all, "detail"] as const,
  detail: (shopId: string) => [...shopQueryKeys.details(), shopId] as const,
};

/** 상점 목록을 페이지 단위로 조회합니다. */
export function useInfiniteShops(query: Omit<GetShopsQuery, "page">) {
  return useInfiniteQuery({
    queryKey: shopQueryKeys.list(query),

    queryFn: ({ pageParam }) =>
      getShops({
        ...query,
        page: pageParam,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;

      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
  });
}

/** 선택된 상점 상세 정보를 조회합니다. */
export function useShopDetail(shopId?: string) {
  return useQuery({
    queryKey: shopQueryKeys.detail(shopId ?? ""),

    queryFn: () => getShopDetail(shopId!),

    enabled: Boolean(shopId),
  });
}
