"use client";

import { DEFAULT_VISITED_SHOP_LIST_LIMIT } from "@sopum-map/shared";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getMyVisitedShops } from "@/api/me/me.api";
import { meQueryKeys } from "@/api/me/me.query-keys";

/** 내 방문 상점 목록을 최근 방문순으로 이어서 조회합니다. */
export function useInfiniteMyVisitedShops() {
  return useInfiniteQuery({
    queryKey: meQueryKeys.visitedShops(),

    queryFn: ({ pageParam }) =>
      getMyVisitedShops({
        page: pageParam,
        limit: DEFAULT_VISITED_SHOP_LIST_LIMIT,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;

      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
  });
}
