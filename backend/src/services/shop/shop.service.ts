import { createApiError, SHOP_MAP_MARKER_LIMIT } from "@sopum-map/shared";
import ShopLikeModel from "../../models/shop-like.model.js";
import ShopModel from "../../models/shop.model.js";
import { getShopCountMaps } from "./shop-count.helper.js";
import {
  buildShopBoundsFilter,
  buildShopListPipeline,
  buildShopMatchFilter,
} from "./shop-query.builder.js";
import { mapShopDetail, mapShopListItem } from "./shop.mapper.js";

import type {
  GetShopDetailServiceParams,
  GetShopDetailServiceResult,
  GetShopMapServiceParams,
  GetShopMapServiceResult,
  GetShopsServiceParams,
  GetShopsServiceResult,
  ShopListAggregateResult,
} from "./shop.service.types.js";

/**
 * 현재 지도 영역 안의 상점을 가벼운 마커 데이터로 조회합니다.
 */
export const getShopMap = async (
  params: GetShopMapServiceParams,
): Promise<GetShopMapServiceResult> => {
  const matchFilter = buildShopMatchFilter(params);
  const boundsFilter = buildShopBoundsFilter(params.bounds);

  const rawShops = await ShopModel.find({
    ...matchFilter,
    ...boundsFilter,
  })
    .select({
      _id: 1,
      name: 1,
      location: 1,
      createdAt: 1,
    })
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .limit(SHOP_MAP_MARKER_LIMIT + 1)
    .lean();

  const isTruncated = rawShops.length > SHOP_MAP_MARKER_LIMIT;
  const shops = rawShops.slice(0, SHOP_MAP_MARKER_LIMIT);
  const shopIds = shops.map((shop) => shop._id);

  const likedShopIds =
    params.userId && shopIds.length > 0
      ? await ShopLikeModel.distinct("shopId", {
          userId: params.userId,
          shopId: {
            $in: shopIds,
          },
        })
      : [];

  const likedShopIdSet = new Set(
    likedShopIds.map((shopId) => shopId.toString()),
  );

  const items = shops.map((shop) => {
    const [longitude, latitude] = shop.location.coordinates;
    const id = shop._id.toString();

    return {
      id,
      name: shop.name,
      latitude,
      longitude,
      isLiked: likedShopIdSet.has(id),
    };
  });

  return {
    items,
    isTruncated,
  };
};

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
  const [likedShopIds, countMaps] = await Promise.all([
    userId
      ? ShopLikeModel.distinct("shopId", {
          userId,
          shopId: { $in: shopIds },
        })
      : [],
    getShopCountMaps(shopIds),
  ]);

  /**
   * 좋아요 여부 확인을 빠르게 하기 위해 Set으로 변환
   */
  const likedShopIdSet = new Set(
    likedShopIds.map((shopId) => shopId.toString()),
  );

  /**
   *  DB 형태 → API 형태
   */
  const items = rawItems.map((shop) => {
    const shopId = shop._id.toString();

    return mapShopListItem({
      shop,
      likeCount: countMaps.likeCountByShopId.get(shopId) ?? 0,
      visitLogCount: countMaps.visitLogCountByShopId.get(shopId) ?? 0,
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
  const [isLiked, countMaps] = await Promise.all([
    userId
      ? ShopLikeModel.exists({
          userId,
          shopId: shop._id,
        }).then(Boolean)
      : Promise.resolve(false),
    getShopCountMaps([shop._id]),
  ]);

  const id = shop._id.toString();

  /**
   * DB 형태 → Shop 상세 API 형태
   */
  return mapShopDetail({
    shop,
    likeCount: countMaps.likeCountByShopId.get(id) ?? 0,
    visitLogCount: countMaps.visitLogCountByShopId.get(id) ?? 0,
    isLiked,
  });
};
