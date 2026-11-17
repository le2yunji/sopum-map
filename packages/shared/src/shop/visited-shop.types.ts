import type { Pagination } from "../api/api.types";
import type { ShopListItem } from "./shop.api.types";

/** 내 방문 상점 목록 조회 조건입니다. */
export type GetMyVisitedShopsQuery = Readonly<{
  page?: number;
  limit?: number;
}>;

/** 방문 상점 하나와 사용자의 방문 정보입니다. */
export type VisitedShopListItem = Readonly<
  ShopListItem & {
    lastVisitedAt: string;
    lastVisitLogAt: string | null;
  }
>;

/** 페이지 단위로 조회한 내 방문 상점 목록입니다. */
export type VisitedShopListData = Readonly<{
  items: VisitedShopListItem[];
  pagination: Pagination;
}>;
