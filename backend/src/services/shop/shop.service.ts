import { createApiError } from "@sopum-map/shared";
import ShopModel from "../../models/shop.model.js";
import { buildShopListPipeline } from "./shop-query.builder.js";
import { mapShopDetail, mapShopListItem } from "./shop.mapper.js";
import type {
  GetShopDetailServiceResult,
  GetShopsServiceParams,
  GetShopsServiceResult,
} from "./shop.service.types.js";

import ShopLikeModel from "../../models/shop-like.model.js";

type ShopListAggregateResult = {
  // items: Parameters<typeof mapShopListItem>[0][];
  items: Parameters<typeof mapShopListItem>[0]["shop"][];

  count: {
    totalCount: number;
  }[];
};

/**
 * Shop 목록 Aggregation 결과의 개별 Shop 타입
 *
 * MongoDB 원본 Shop 필드에
 * $geoNear가 생성하는 distance가 추가될 수 있다.
 */
export const getShops = async (
  params: GetShopsServiceParams,
): Promise<GetShopsServiceResult> => {
  /**
   * 1.
   * 요청 조건을 MongoDB Pipeline으로 변환
   */
  const pipeline = buildShopListPipeline(params);

  /**
   * 2.
   * Data Layer(Mongoose)를 통해 MongoDB 조회
   */

  const [result] = await ShopModel.aggregate<ShopListAggregateResult>(pipeline);

  const rawItems = result?.items ?? [];
  const totalCount = result?.count?.[0]?.totalCount ?? 0;

  /**
   * 3.
   * 로그인 사용자인 경우
   * 현재 페이지의 Shop 중 좋아요한 Shop ID만 조회
   */
  const likedShopIds = params.userId
    ? await ShopLikeModel.find({
        userId: params.userId,
        shopId: {
          $in: rawItems.map((shop) => shop._id),
        },
      }).distinct("shopId")
    : [];

  /**
   * 좋아요 여부 확인을 빠르게 하기 위해 Set으로 변환
   */
  const likedShopIdSet = new Set(
    likedShopIds.map((shopId) => shopId.toString()),
  );

  /**
   * 3. DB 형태 → API 형태
   */
  const items = rawItems.map((shop) =>
    mapShopListItem({
      shop,
      visitLogCount: 0,
      isLiked: likedShopIdSet.has(shop._id.toString()),
    }),
  );

  /**
   * 4.
   * 페이지 수 계산
   */
  const totalPages = Math.ceil(totalCount / params.limit);

  /**
   * 5.
   * 다음 페이지 유무
   */
  const hasNext = params.page < totalPages;

  /**
   * 6.
   * Controller에게 Service 결과 반환
   */
  return {
    items,

    pagination: {
      totalCount,
      page: params.page,
      limit: params.limit,
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
  shopId: string,
): Promise<GetShopDetailServiceResult> => {
  /**
   * 1.
   * MongoDB에서 Shop 조회
   *
   * lean()을 사용해서 Mongoose Document가 아닌
   * 일반 JavaScript Object로 받는다.
   */
  const shop = await ShopModel.findOne({
    _id: shopId,
    status: "active",
  }).lean();

  /**
   * 2.
   * Shop이 존재하지 않는 경우
   */
  if (!shop) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "상점을 찾을 수 없습니다.",
    });
  }

  /**
   * 3.
   * DB 형태 → Shop 상세 API 형태
   */
  return mapShopDetail(shop);
};
