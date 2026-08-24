// shop.query.types.ts

import type { Types } from "mongoose";

import type { ShopSchemaType } from "../../models/shop.model";

/**
 * MongoDB에서 조회한 Shop 문서 형태
 *
 * Schema 필드 +
 * MongoDB _id +
 * timestamps +
 * Aggregation에서 동적으로 생성되는 distance
 */
export type ShopQueryResult = ShopSchemaType & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type ShopListAggregateItem = ShopQueryResult & {
  distance?: number;
};

/**
 * Shop 목록 $facet 결과
 */
export type ShopListFacetResult = {
  items: ShopListAggregateItem[];

  count: Array<{
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
 * 로그인 사용자가 좋아요한 Shop 조회 결과
 */
export type LikedShopDocument = {
  shopId: Types.ObjectId;
};
