import type { Types } from "mongoose";

import type { ShopSchemaType } from "../../models/shop.model";

/**
 * 컨트롤러에서 기본값 적용과 검증을 마치고
 * 서비스에 전달하는 매장 목록 조회 조건
 */
export type GetShopsServiceParams = {
  category?: ShopSchemaType["category"];
  keyword?: string;
  region1?: string;
  region2?: string;
  region3?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page: number;
  limit: number;
  sort: "latest" | "distance" | "bookmark";

  /**
   * optionalAuthMiddleware가 설정한 로그인 사용자 ID
   */
  userId?: string;
};

/**
 * lean() 또는 aggregate()를 통해 얻는 Shop 문서 타입
 *
 * timestamps로 생성되는 createdAt, updatedAt과
 * Aggregation으로 생성되는 distance를 추가한다.
 */
export type ShopDocument = ShopSchemaType & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  distance?: number;
};

/**
 * MongoDB $facet 실행 결과
 */
export type ShopListFacetResult = {
  items: ShopDocument[];
  metadata: Array<{
    totalCount: number;
  }>;
};

/**
 * 방문 기록 개수 Aggregation 결과
 */
export type VisitLogCountAggregationResult = {
  _id: Types.ObjectId;
  count: number;
};

/**
 * 로그인 사용자의 좋아요 조회 결과
 */
export type LikedShopDocument = {
  shopId: Types.ObjectId;
};
