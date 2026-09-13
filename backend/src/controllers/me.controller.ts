import type { NextFunction, Request, Response } from "express";

import { getLikedShops } from "../services/shop-like.service.js";
import { likedShopsQuerySchema } from "../validations/shop-like.validation.js";

export async function getMyLikedShops(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const { page, limit } = likedShopsQuerySchema.parse(req.query);

    const result = await getLikedShops({
      userId,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
