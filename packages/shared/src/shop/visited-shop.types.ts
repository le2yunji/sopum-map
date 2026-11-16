import type { Pagination } from "../api/api.types";
import type { ShopListItem } from "./shop.api.types";

/** 내 방문 상점 목록 조회 조건입니다. */
export type GetMyVisitedShopsQuery = Readonly<{
  page?: number;
  limit?: number;
}>;

/** 방문 상점 하나와 사용자의 마지막 방문 시각입니다. */
export type VisitedShopListItem = Readonly<
  ShopListItem & {
    lastVisitedAt: string;
  }
>;

/** 페이지 단위로 조회한 내 방문 상점 목록입니다. */
export type VisitedShopListData = Readonly<{
  items: VisitedShopListItem[];
  pagination: Pagination;
}>;
