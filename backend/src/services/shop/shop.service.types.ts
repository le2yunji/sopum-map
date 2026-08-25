import type {
  GetShopsQuery,
  ShopListData,
  ShopDetailData,
} from "@sopum-map/shared";

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
};

export type GetShopsServiceResult = ShopListData;

/**
 * Shop 상세 Service 반환 타입
 */
export type GetShopDetailServiceResult = ShopDetailData;
