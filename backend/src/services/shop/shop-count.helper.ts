import type { Types } from "mongoose";

import ShopLikeModel from "../../models/shop-like.model.js";
import VisitLogModel from "../../models/visit-log.model.js";

type ShopCountAggregate = Readonly<{
  _id: Types.ObjectId;
  count: number;
}>;

type ShopCountMaps = Readonly<{
  likeCountByShopId: ReadonlyMap<string, number>;
  visitLogCountByShopId: ReadonlyMap<string, number>;
}>;

/** 상점별 집계 결과를 상점 ID로 바로 찾을 수 있는 Map으로 바꿉니다. */
function createShopCountMap(
  results: readonly ShopCountAggregate[],
): ReadonlyMap<string, number> {
  return new Map(
    results.map((result) => [result._id.toString(), result.count]),
  );
}

/** 여러 상점의 실제 좋아요 수와 활성 방문 로그 수를 한 번씩 집계합니다. */
export async function getShopCountMaps(
  shopIds: readonly Types.ObjectId[],
): Promise<ShopCountMaps> {
  if (shopIds.length === 0) {
    return {
      likeCountByShopId: new Map(),
      visitLogCountByShopId: new Map(),
    };
  }

  const [likeCounts, visitLogCounts] = await Promise.all([
    ShopLikeModel.aggregate<ShopCountAggregate>([
      { $match: { shopId: { $in: shopIds } } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]),
    VisitLogModel.aggregate<ShopCountAggregate>([
      { $match: { shopId: { $in: shopIds }, status: "active" } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]),
  ]);

  return {
    likeCountByShopId: createShopCountMap(likeCounts),
    visitLogCountByShopId: createShopCountMap(visitLogCounts),
  };
}
