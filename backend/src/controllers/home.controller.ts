import { getHomeCuratedShops } from "../services/home/home.service.js";
import type { GetHomeCuratedShopResponse } from "@sopum-map/shared";

import type { NextFunction, Request, Response } from "express";

/**
 * GET /api/home
 */
export const getHomeCuratedShopsController = async (
  _req: Request,
  res: Response<GetHomeCuratedShopResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await getHomeCuratedShops();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
