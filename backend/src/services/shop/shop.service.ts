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

type ShopCountAggregate = Readonly<{
  _id: { toString(): string };
  count: number;
}>;

/** 상점별 집계 결과를 빠르게 조회할 수 있는 Map으로 바꿉니다. */
function createShopCountMap(
  results: readonly ShopCountAggregate[],
): ReadonlyMap<string, number> {
  return new Map(results.map((result) => [result._id.toString(), result.count]));
}

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
  const shopIds = rawItems.map((shop) => shop._id);
  const [likedShopIds, likeCounts, visitLogCounts] = await Promise.all([
    userId
      ? ShopLikeModel.distinct("shopId", {
          userId,
          shopId: { $in: shopIds },
        })
      : [],
    shopIds.length > 0
      ? ShopLikeModel.aggregate<ShopCountAggregate>([
          { $match: { shopId: { $in: shopIds } } },
          { $group: { _id: "$shopId", count: { $sum: 1 } } },
        ])
      : [],
    shopIds.length > 0
      ? VisitLogModel.aggregate<ShopCountAggregate>([
          { $match: { shopId: { $in: shopIds }, status: "active" } },
          { $group: { _id: "$shopId", count: { $sum: 1 } } },
        ])
      : [],
  ]);

  /**
   * 좋아요 여부 확인을 빠르게 하기 위해 Set으로 변환
   */
  const likedShopIdSet = new Set(
    likedShopIds.map((shopId) => shopId.toString()),
  );
  const likeCountByShopId = createShopCountMap(likeCounts);
  const visitLogCountByShopId = createShopCountMap(visitLogCounts);

  /**
   *  DB 형태 → API 형태
   */
  const items = rawItems.map((shop) => {
    const shopId = shop._id.toString();

    return mapShopListItem({
      shop,
      likeCount: likeCountByShopId.get(shopId) ?? 0,
      visitLogCount: visitLogCountByShopId.get(shopId) ?? 0,
      isLiked: likedShopIdSet.has(shopId),
    });
  });

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
      status: "active",
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
