import { Types } from "mongoose";

import ShopLikeModel from "../models/shop-like.model.js";
import ShopModel from "../models/shop.model.js";

import PickFolderModel from "../models/pick-folder.model.js";
import PickFolderItemModel from "../models/pick-folder-item.model.js";
import { getShopMapByIds } from "./shop/shop-query.helper.js";

/**
 * 상점에 좋아요 추가
 */
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

/**
 * 상점 좋아요를 취소하고 모든 내 픽 폴더에서도 제거
 */
export async function unlikeShop(userId: string, shopId: string) {
  const objectUserId = new Types.ObjectId(userId);
  const objectShopId = new Types.ObjectId(shopId);

  const folders = await PickFolderModel.find({
    userId: objectUserId,
  })
    .select({
      _id: 1,
    })
    .lean();

  const folderIds = folders.map((folder) => folder._id);

  await Promise.all([
    ShopLikeModel.deleteOne({
      userId: objectUserId,
      shopId: objectShopId,
    }),

    folderIds.length > 0
      ? PickFolderItemModel.deleteMany({
          shopId: objectShopId,
          folderId: {
            $in: folderIds,
          },
        })
      : Promise.resolve(),
  ]);

  const likeCount = await ShopLikeModel.countDocuments({
    shopId: objectShopId,
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

/**
 * 내가 좋아요한 전체 상점 목록 조회
 */
export async function getLikedShops({
  userId,
  page,
  limit,
}: GetLikedShopsParams) {
  const objectUserId = new Types.ObjectId(userId);
  const skip = (page - 1) * limit;

  /**
   * 현재 사용자가 좋아요한 상점 ID를
   * 최신 좋아요 순으로 조회
   */
  const likes = await ShopLikeModel.find({
    userId: objectUserId,
  })
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  const totalCount = await ShopLikeModel.countDocuments({
    userId: objectUserId,
  });

  const shopIds = likes.map((like) => like.shopId);

  const shopMap = await getShopMapByIds(shopIds);

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
