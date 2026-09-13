import { Types } from "mongoose";

import ShopLikeModel from "../models/shop-like.model.js";
import ShopModel from "../models/shop.model.js";

export async function likeShop(userId: string, shopId: string) {
  const shop = await ShopModel.exists({
    _id: shopId,
  });

  if (!shop) {
    throw new Error("존재하지 않는 상점입니다.");
  }

  await ShopLikeModel.updateOne(
    {
      userId: new Types.ObjectId(userId),
      shopId: new Types.ObjectId(shopId),
    },
    {
      $setOnInsert: {
        userId: new Types.ObjectId(userId),
        shopId: new Types.ObjectId(shopId),
      },
    },
    {
      upsert: true,
    },
  );

  const likeCount = await ShopLikeModel.countDocuments({
    shopId,
  });

  return {
    shopId,
    isLiked: true,
    likeCount,
  };
}

export async function unlikeShop(userId: string, shopId: string) {
  await ShopLikeModel.deleteOne({
    userId: new Types.ObjectId(userId),
    shopId: new Types.ObjectId(shopId),
  });

  const likeCount = await ShopLikeModel.countDocuments({
    shopId,
  });

  return {
    shopId,
    isLiked: false,
    likeCount,
  };
}

type GetLikedShopsParams = Readonly<{
  userId: string;
  page: number;
  limit: number;
}>;

export async function getLikedShops({
  userId,
  page,
  limit,
}: GetLikedShopsParams) {
  const skip = (page - 1) * limit;

  /**
   * 현재 사용자가 좋아요한 상점 ID를
   * 최신 좋아요 순으로 조회합니다.
   */
  const likes = await ShopLikeModel.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  const totalCount = await ShopLikeModel.countDocuments({
    userId: new Types.ObjectId(userId),
  });

  const shopIds = likes.map((like) => like.shopId);

  const shops = await ShopModel.find({
    _id: {
      $in: shopIds,
    },
  });

  /**
   * $in 조회는 likes의 정렬 순서를 보장하지 않으므로
   * shopId 기준 Map을 만든 뒤 좋아요 순서대로 다시 정렬합니다.
   */
  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  const items = likes
    .map((like) => {
      const shop = shopMap.get(like.shopId.toString());

      if (!shop) {
        return null;
      }

      return {
        id: shop._id.toString(),
        name: shop.name,
        category: shop.category,
        address: shop.address,

        /**
         * 이 API에서 조회되는 상점은
         * 당연히 현재 사용자가 좋아요한 상태입니다.
         */
        isLiked: true,

        likedAt: like.createdAt,
      };
    })
    .filter((shop) => shop !== null);

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
}
