import type { HomeData } from "@sopum-map/shared";

import HomeShopCurationModel from "../../models/home-shop-curation.model";
import ShopModel from "../../models/shop.model";

import { buildHomeCuratedShops } from "./home.mapper";

/**
 * 현재 홈 화면에 노출할 데이터를 조회한다.
 */
export const getHome = async (): Promise<HomeData> => {
  const now = new Date();

  /**
   * 현재 시간이 노출 기간 안에 들어가는
   * 가장 최근 큐레이션을 조회한다.
   *
   * startAt <= now < endAt
   */
  const curation = await HomeShopCurationModel.findOne({
    startAt: {
      $lte: now,
    },

    endAt: {
      $gt: now,
    },
  })
    .sort({
      startAt: -1,
    })
    .lean();

  /**
   * 현재 노출 중인 큐레이션이 없다면
   * 정상적인 빈 홈 데이터로 반환한다.
   */
  if (!curation) {
    return {
      featuredShops: [],
    };
  }

  const shopIds = curation.items.map((item) => item.shopId);

  /**
   * 실제 사용자에게 노출 가능한 상점만 조회한다.
   *
   * 큐레이션 등록 이후 Shop이 closed / hidden으로
   * 변경된 경우 홈에서 자동 제외된다.
   */
  const shops = await ShopModel.find({
    _id: {
      $in: shopIds,
    },

    status: "active",
  })
    .select({
      name: 1,
      description: 1,
      images: 1,
      tagStats: 1,
    })
    .lean();

  return {
    featuredShops: buildHomeCuratedShops(curation.items, shops),
  };
};
