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
