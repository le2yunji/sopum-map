import type { NextFunction, Request, Response } from "express";

import { getLikedShops } from "../services/shop-like.service.js";

export async function getMyLikedShops(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 20;

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
