import { Types } from "mongoose";

import ShopModel from "../../models/shop.model.js";

/**
 * 상점 ID 목록을 조회하고 shopId 기준 Map으로 반환
 */
export async function getShopMapByIds(shopIds: Types.ObjectId[]) {
  const shops = await ShopModel.find({
    _id: {
      $in: shopIds,
    },
  });

  return new Map(shops.map((shop) => [shop._id.toString(), shop]));
}
