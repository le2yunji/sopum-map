import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  aggregateLikeCounts: vi.fn(),
  aggregateVisitLogCounts: vi.fn(),
}));

vi.mock("../../models/shop-like.model.js", () => ({
  default: {
    aggregate: modelMocks.aggregateLikeCounts,
  },
}));

vi.mock("../../models/visit-log.model.js", () => ({
  default: {
    aggregate: modelMocks.aggregateVisitLogCounts,
  },
}));

import { getShopCountMaps } from "./shop-count.helper.js";

describe("getShopCountMaps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    modelMocks.aggregateLikeCounts.mockResolvedValue([]);
    modelMocks.aggregateVisitLogCounts.mockResolvedValue([]);
  });

  it("조회할 상점이 없으면 집계 쿼리를 실행하지 않는다", async () => {
    const result = await getShopCountMaps([]);

    expect(result.likeCountByShopId.size).toBe(0);
    expect(result.visitLogCountByShopId.size).toBe(0);
    expect(modelMocks.aggregateLikeCounts).not.toHaveBeenCalled();
    expect(modelMocks.aggregateVisitLogCounts).not.toHaveBeenCalled();
  });

  it("상점별 좋아요와 활성 방문 로그 수를 Map으로 반환한다", async () => {
    const shopId = new Types.ObjectId("64b000000000000000000001");

    modelMocks.aggregateLikeCounts.mockResolvedValue([
      { _id: shopId, count: 7 },
    ]);
    modelMocks.aggregateVisitLogCounts.mockResolvedValue([
      { _id: shopId, count: 3 },
    ]);

    const result = await getShopCountMaps([shopId]);

    expect(result.likeCountByShopId.get(shopId.toString())).toBe(7);
    expect(result.visitLogCountByShopId.get(shopId.toString())).toBe(3);
    expect(modelMocks.aggregateLikeCounts).toHaveBeenCalledWith([
      { $match: { shopId: { $in: [shopId] } } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]);
    expect(modelMocks.aggregateVisitLogCounts).toHaveBeenCalledWith([
      { $match: { shopId: { $in: [shopId] }, status: "active" } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]);
  });
});
