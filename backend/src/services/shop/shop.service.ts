import {
  createApiError,
  type ShopDetailData,
  type ShopListData,
} from "@sopum-map/shared";
import mongoose, { Types } from "mongoose";

import LikeModel from "../../models/like.model";
import ShopModel from "../../models/shop.model";
import VisitLogModel from "../../models/visit-log.model";
import { mapShopDetail, mapShopListItem } from "./shop.mapper";
import { buildShopListPipeline } from "./shop-query.builder";
import type {
  GetShopsServiceParams,
  LikedShopDocument,
  ShopDocument,
  ShopListFacetResult,
  VisitLogCountAggregationResult,
} from "./shop.service.types";

/**
 * 문자열이 올바른 MongoDB ObjectId인지 확인하고 변환한다.
 */
const toObjectId = (value: string, fieldName: string): Types.ObjectId => {
  if (!mongoose.isObjectIdOrHexString(value)) {
    throw createApiError({
      status: 400,
      code: "INVALID_PARAMETER",
      message: `${fieldName} 값이 올바르지 않습니다.`,
      details: {
        [fieldName]: `${fieldName} 값이 올바른 ObjectId 형식이 아닙니다.`,
      },
    });
  }

  return new Types.ObjectId(value);
};

/**
 * 매장 ID별 방문 기록 개수를 조회한다.
 *
 * 매장마다 countDocuments를 실행하지 않고,
 * 한 번의 Aggregation으로 여러 매장의 개수를 계산한다.
 */
const getVisitLogCountMap = async (
  shopIds: Types.ObjectId[],
): Promise<Map<string, number>> => {
  if (shopIds.length === 0) {
    return new Map();
  }

  const results = await VisitLogModel.aggregate<VisitLogCountAggregationResult>(
    [
      {
        $match: {
          shopId: {
            $in: shopIds,
          },
        },
      },
      {
        $group: {
          _id: "$shopId",
          count: {
            $sum: 1,
          },
        },
      },
    ],
  );

  return new Map(
    results.map((result) => [result._id.toString(), result.count]),
  );
};

/**
 * 로그인 사용자가 좋아요한 매장 ID 목록을 조회한다.
 *
 * 비로그인 사용자인 경우 빈 Set을 반환한다.
 */
const getLikedShopIdSet = async (
  userId: string | undefined,
  shopIds: Types.ObjectId[],
): Promise<Set<string>> => {
  if (!userId || shopIds.length === 0) {
    return new Set();
  }

  const userObjectId = toObjectId(userId, "userId");

  const likes = await LikeModel.find({
    userId: userObjectId,
    shopId: {
      $in: shopIds,
    },
  })
    .select({
      _id: 0,
      shopId: 1,
    })
    .lean<LikedShopDocument[]>();

  return new Set(likes.map((like) => like.shopId.toString()));
};

/**
 * 검색 조건에 맞는 매장 목록을 조회한다.
 */
export const getShops = async (
  params: GetShopsServiceParams,
): Promise<ShopListData> => {
  const pipeline = buildShopListPipeline(params);

  const [facetResult] =
    await ShopModel.aggregate<ShopListFacetResult>(pipeline);

  const shops = facetResult?.items ?? [];

  const totalCount = facetResult?.metadata?.[0]?.totalCount ?? 0;

  const totalPages =
    totalCount === 0 ? 0 : Math.ceil(totalCount / params.limit);

  const shopIds = shops.map((shop) => shop._id);

  /*
   * 방문 기록 수와 사용자 좋아요 여부는
   * 서로 독립적이므로 동시에 조회한다.
   */
  const [visitLogCountMap, likedShopIdSet] = await Promise.all([
    getVisitLogCountMap(shopIds),
    getLikedShopIdSet(params.userId, shopIds),
  ]);

  const items = shops.map((shop) => {
    const shopId = shop._id.toString();

    return mapShopListItem({
      shop,
      visitLogCount: visitLogCountMap.get(shopId) ?? 0,
      isLiked: likedShopIdSet.has(shopId),
    });
  });

  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      totalCount,
      totalPages,
      hasNext: params.page < totalPages,
    },
  };
};

/**
 * 매장 ID로 활성 상태의 매장 상세 정보를 조회한다.
 */
export const getShopById = async (
  shopId: string,
  userId?: string,
): Promise<ShopDetailData> => {
  const shopObjectId = toObjectId(shopId, "shopId");

  const shop = await ShopModel.findOne({
    _id: shopObjectId,
    status: "active",
  }).lean<ShopDocument | null>();

  if (!shop) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "매장을 찾을 수 없습니다.",
    });
  }

  const [visitLogCount, likedShopIdSet] = await Promise.all([
    VisitLogModel.countDocuments({
      shopId: shopObjectId,
    }),
    getLikedShopIdSet(userId, [shopObjectId]),
  ]);

  return mapShopDetail({
    shop,
    visitLogCount,
    isLiked: likedShopIdSet.has(shopId),
  });
};
