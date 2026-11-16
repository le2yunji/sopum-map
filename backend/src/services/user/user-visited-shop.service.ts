import type { VisitedShopListData } from "@sopum-map/shared";
import { Types, type PipelineStage } from "mongoose";

import CourseShopVisitModel from "../../models/course-shop-visit.model.js";
import ShopLikeModel from "../../models/shop-like.model.js";
import ShopModel from "../../models/shop.model.js";
import VisitLogModel from "../../models/visit-log.model.js";

import { getShopCountMaps } from "../shop/shop-count.helper.js";
import { mapShopListItem } from "../shop/shop.mapper.js";

import type { ShopListAggregateItem } from "../shop/shop.query.types.js";

type GetMyVisitedShopsParams = Readonly<{
  userId: string;
  page: number;
  limit: number;
}>;

type VisitedShopAggregationItem = Readonly<{
  _id: Types.ObjectId;
  lastVisitedAt: Date;
  lastVisitLogAt: Date | null;
  shop: ShopListAggregateItem;
}>;

type VisitedShopAggregationPage = Readonly<{
  items: VisitedShopAggregationItem[];
  total: Array<Readonly<{ count: number }>>;
}>;

/** 방문 상점을 판단하는 공통 규칙을 만듭니다. */
function createVisitedShopBasePipeline(
  objectUserId: Types.ObjectId,
): PipelineStage[] {
  return [
    {
      $match: {
        userId: objectUserId,
        status: "active",
      },
    },
    {
      $project: {
        _id: 0,
        shopId: 1,
        lastVisitedAt: "$visitedAt",
        lastVisitLogAt: "$visitedAt",
      },
    },
    {
      $unionWith: {
        coll: CourseShopVisitModel.collection.name,
        pipeline: [
          {
            $match: {
              userId: objectUserId,
            },
          },
          {
            $project: {
              _id: 0,
              shopId: 1,
              lastVisitedAt: "$createdAt",
              lastVisitLogAt: {
                $literal: null,
              },
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$shopId",
        lastVisitedAt: {
          $max: "$lastVisitedAt",
        },
        lastVisitLogAt: {
          $max: "$lastVisitLogAt",
        },
      },
    },
    {
      $lookup: {
        from: ShopModel.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "shop",
      },
    },
    {
      $unwind: "$shop",
    },
    {
      $match: {
        "shop.status": "active",
      },
    },
  ];
}

type VisitedShopCountAggregation = Readonly<{
  count: number;
}>;

/** 로그인 사용자가 방문한 활성 상점 수를 중복 없이 계산합니다. */
export async function countMyVisitedShops(userId: string): Promise<number> {
  const objectUserId = new Types.ObjectId(userId);

  const [result] = await VisitLogModel.aggregate<VisitedShopCountAggregation>([
    ...createVisitedShopBasePipeline(objectUserId),
    {
      $count: "count",
    },
  ]);

  return result?.count ?? 0;
}

/** 로그인 사용자의 방문 상점을 중복 없이 최근 방문순으로 조회합니다. */
export async function getMyVisitedShops({
  userId,
  page,
  limit,
}: GetMyVisitedShopsParams): Promise<VisitedShopListData> {
  const objectUserId = new Types.ObjectId(userId);
  const skip = (page - 1) * limit;

  const [aggregationPage] =
    await VisitLogModel.aggregate<VisitedShopAggregationPage>([
      ...createVisitedShopBasePipeline(objectUserId),
      {
        $sort: {
          lastVisitedAt: -1,
          _id: -1,
        },
      },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ]);

  const visitedShops = aggregationPage?.items ?? [];
  const totalCount = aggregationPage?.total[0]?.count ?? 0;
  const shopIds = visitedShops.map((item) => item._id);

  const [likedShops, countMaps] = await Promise.all([
    ShopLikeModel.find({
      userId: objectUserId,
      shopId: {
        $in: shopIds,
      },
    })
      .select({
        shopId: 1,
      })
      .lean(),

    getShopCountMaps(shopIds),
  ]);

  const likedShopIds = new Set(
    likedShops.map((like) => like.shopId.toString()),
  );

  const items = visitedShops.map(
    ({ _id, shop, lastVisitedAt, lastVisitLogAt }) => {
      const shopId = _id.toString();

      return {
        ...mapShopListItem({
          shop,
          likeCount: countMaps.likeCountByShopId.get(shopId) ?? 0,
          visitLogCount: countMaps.visitLogCountByShopId.get(shopId) ?? 0,
          isLiked: likedShopIds.has(shopId),
        }),
        lastVisitedAt: lastVisitedAt.toISOString(),
        lastVisitLogAt: lastVisitLogAt?.toISOString() ?? null,
      };
    },
  );

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items,
    pagination: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
    },
  };
}
