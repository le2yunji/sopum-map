import type {
  GetShopsQuery,
  ShopListData,
  ShopDetailData,
} from "@sopum-map/shared";
import { mapShopListItem } from "./shop.mapper.js";

/**
 * Shop 목록 Aggregation 결과의 개별 Shop 타입
 *
 * MongoDB 원본 Shop 필드에
 * $geoNear가 생성하는 distance가 추가될 수 있다.
 */
export type ShopListAggregateItem = Parameters<
  typeof mapShopListItem
>[0]["shop"];

export type ShopListAggregateCount = {
  totalCount: number;
};

export type ShopListAggregateResult = {
  items: ShopListAggregateItem[];
  count: ShopListAggregateCount[];
};

/**
 * 컨트롤러에서 기본값 적용과 검증을 마치고
 * 서비스에 전달하는 매장 목록 조회 조건
 *
 * API 요청 시점에는 optional이지만 Service 시점에는 필수이기 때문
 */
export type GetShopsServiceParams = Omit<
  GetShopsQuery,
  "page" | "limit" | "sort"
> & {
  page: NonNullable<GetShopsQuery["page"]>;
  limit: NonNullable<GetShopsQuery["limit"]>;
  sort: NonNullable<GetShopsQuery["sort"]>;

  /** 로그인 사용자인 경우 좋아요 여부 계산에 사용 */
  userId?: string;
};

export type GetShopsServiceResult = ShopListData;

/**
 * Shop 상세 조회 Service 입력값
 */
export type GetShopDetailServiceParams = {
  shopId: string;
  /** 로그인 사용자인 경우 좋아요 여부 계산에 사용 */
  userId?: string;
};

/**
 * Shop 상세 Service 반환 타입
 */
export type GetShopDetailServiceResult = ShopDetailData;
