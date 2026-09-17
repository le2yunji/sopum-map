import { createApiError } from "@sopum-map/shared";
import ShopModel from "../../models/shop.model.js";
import { buildShopListPipeline } from "./shop-query.builder.js";
import { mapShopDetail, mapShopListItem } from "./shop.mapper.js";
import type {
  GetShopDetailServiceResult,
  GetShopsServiceParams,
  GetShopsServiceResult,
  GetShopDetailServiceParams,
  ShopListAggregateResult,
} from "./shop.service.types.js";

import ShopLikeModel from "../../models/shop-like.model.js";
import VisitLogModel from "../../models/visit-log.model.js";

export const getShops = async (
  params: GetShopsServiceParams,
): Promise<GetShopsServiceResult> => {
  const { userId, page, limit } = params;

  /**
   * 요청 조건을 MongoDB Pipeline으로 변환
   */
  const pipeline = buildShopListPipeline(params);

  const [result] = await ShopModel.aggregate<ShopListAggregateResult>(pipeline);

  const rawItems = result?.items ?? [];
  const totalCount = result?.count?.[0]?.totalCount ?? 0;

  /**
   * 로그인 사용자인 경우
   * 현재 페이지의 Shop 중 좋아요한 Shop ID만 조회
   */
  const likedShopIds = userId
    ? await ShopLikeModel.distinct("shopId", {
        userId,
        shopId: {
          $in: rawItems.map((shop) => shop._id),
        },
      })
    : [];

  /**
   * 좋아요 여부 확인을 빠르게 하기 위해 Set으로 변환
   */
  const likedShopIdSet = new Set(
    likedShopIds.map((shopId) => shopId.toString()),
  );

  /**
   *  DB 형태 → API 형태
   */
  const items = rawItems.map((shop) =>
    mapShopListItem({
      shop,
      visitLogCount: 0,
      isLiked: likedShopIdSet.has(shop._id.toString()),
    }),
  );

  const totalPages = Math.ceil(totalCount / limit);

  const hasNext = page < totalPages;

  return {
    items,

    pagination: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNext,
    },
  };
};

/**
 * Shop 상세 조회
 *
 * shopId에 해당하는 활성화된 Shop 하나를 조회한다.
 */
export const getShopById = async (
  params: GetShopDetailServiceParams,
): Promise<GetShopDetailServiceResult> => {
  const { userId, shopId } = params;

  const shop = await ShopModel.findOne({
    _id: shopId,
    status: "active",
  });

  if (!shop) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "상점을 찾을 수 없습니다.",
    });
  }
  const [isLiked, visitLogCount] = await Promise.all([
    userId
      ? ShopLikeModel.exists({
          userId,
          shopId: shop._id,
        }).then(Boolean)
      : Promise.resolve(false),

    VisitLogModel.countDocuments({
      shopId: shop._id,
    }),
  ]);

  /**
   * DB 형태 → Shop 상세 API 형태
   */
  return mapShopDetail({
    shop,
    visitLogCount,
    isLiked,
  });
};
