import { getHome } from "../services/home/home.service";
import type { GetHomeResponse } from "@sopum-map/shared";

import type { NextFunction, Request, Response } from "express";

/**
 * GET /api/home
 */
export const getHomeController = async (
  _req: Request,
  res: Response<GetHomeResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await getHome();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
