import type { ApiSuccessResponse, ShopRegionGroup, ShopTag } from "../index.js";

export type HomeCuratedShop = {
  shopId: string;
  regionGroup: ShopRegionGroup;

  name: string;
  mainImageUrl: string | null;

  tags: ShopTag[];

  description: string | null;

  /**
   * 홈 큐레이션 선정 시 관리자가 작성하는 한 줄 소개.
   */
  curatorText: string | null;
};

export type HomeCuratedShops = {
  curatedShops: HomeCuratedShop[];
};

/**
 * GET /api/home 성공 응답
 */
export type GetHomeCuratedShopResponse = ApiSuccessResponse<HomeCuratedShops>;
