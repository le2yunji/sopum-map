import type { ApiSuccessResponse } from "../api/api.types";
import type { ShopListData } from "./shop.api.types";

/**
 * 상점 좋아요 추가/취소 결과
 */
export type ShopLikeData = {
  shopId: string;
  isLiked: boolean;
  likeCount: number;
};

/**
 * GET /api/me/liked-shops Query
 */
export type GetLikedShopsQuery = {
  page?: number;
  limit?: number;
};

/**
 * POST /api/shops/:shopId/likes 성공 응답
 */
export type CreateShopLikeResponse = ApiSuccessResponse<ShopLikeData>;

/**
 * DELETE /api/shops/:shopId/likes 성공 응답
 */
export type DeleteShopLikeResponse = ApiSuccessResponse<ShopLikeData>;

/**
 * GET /api/me/liked-shops 성공 응답
 *
 * 좋아요 목록도 일반 Shop 목록과 동일한 item/pagination 구조를 사용한다.
 */
export type GetLikedShopsResponse = ApiSuccessResponse<ShopListData>;
