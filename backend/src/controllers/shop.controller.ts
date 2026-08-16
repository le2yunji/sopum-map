import type { NextFunction, Request, Response } from "express";

import { getShopById, getShops } from "../services/shop/shop.service";
import { getShopsQuerySchema } from "../validations/shop.validation";

/**
 * optionalAuthMiddleware가 로그인 사용자 정보를
 * req.user에 저장한다고 가정한 Request 타입
 */
type RequestWithOptionalUser = Request & {
  user?: {
    id: string;
  };
};

/**
 * GET /shops
 *
 * Query Parameter를 검증한 뒤
 * 서비스에 매장 목록 조회를 요청한다.
 */
export const getShopListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = getShopsQuerySchema.parse(req.query);

    const requestWithUser = req as RequestWithOptionalUser;

    const data = await getShops({
      ...query,
      userId: requestWithUser.user?.id,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    /*
     * ZodError와 ApiError를
     * errorMiddleware로 전달한다.
     */
    next(error);
  }
};

/**
 * GET /shops/:shopId
 *
 * URL의 shopId로 매장 상세 정보를 조회한다.
 */
export const getShopDetailController = async (
  req: Request<{
    shopId: string;
  }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const requestWithUser = req as RequestWithOptionalUser;
    const data = await getShopById(
      req.params.shopId,
      requestWithUser.user?.id,
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
