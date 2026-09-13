import type { NextFunction, Request, Response } from "express";

import { likeShop, unlikeShop } from "../services/shop-like.service.js";
import { shopIdParamsSchema } from "../validations/shop.validation.js";

type ShopLikeParams = {
  shopId: string;
};

export async function createShopLike(
  req: Request<ShopLikeParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId } = shopIdParamsSchema.parse(req.params);

    const userId = req.auth?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });

      return;
    }

    const result = await likeShop(userId, shopId);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteShopLike(
  req: Request<ShopLikeParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId } = shopIdParamsSchema.parse(req.params);

    const userId = req.auth?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });

      return;
    }

    const result = await unlikeShop(userId, shopId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
