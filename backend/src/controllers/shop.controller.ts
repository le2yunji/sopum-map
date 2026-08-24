import type { NextFunction, Request, Response } from "express";
import type {
  GetShopsResponse,
  GetShopDetailResponse,
} from "@sopum-map/shared";
import { getShops, getShopById } from "../services/shop/shop.service";
import {
  getShopDetailParamsSchema,
  getShopsQuerySchema,
} from "../validations/shop.validation";

/**
 * GET /api/shops
 *
 * Query Parameter를 검증한 뒤
 * 서비스에 매장 목록 조회를 요청한다.
 */
export const getShopsController = async (
  req: Request,
  res: Response<GetShopsResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    /**
     * 1.
     * HTTP Query 검증
     *
     * req.query의 string 값들을
     * 정상적인 Service 입력값으로 변환한다.
     */
    const query = getShopsQuerySchema.parse(req.query);

    /**
     * 2.
     * Business Layer 호출
     */
    const data = await getShops(query);

    /**
     * 3.
     * HTTP Response 반환
     */

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
 * GET /api/shops/:shopId
 *
 * URL Parameter의 shopId를 검증한 뒤
 * 서비스에 특정 매장 상세 조회를 요청한다.
 */
export const getShopDetailController = async (
  req: Request,
  res: Response<GetShopDetailResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    /**
     * 1.
     * URL Parameter 검증
     *
     * 예:
     * GET /api/shops/6a8a68e15e2aa43be6a654ab
     *
     * req.params:
     * {
     *   shopId: "6a8a68e15e2aa43be6a654ab"
     * }
     */
    const { shopId } = getShopDetailParamsSchema.parse(req.params);

    /**
     * 2.
     * Business Layer 호출
     */
    const data = await getShopById(shopId);

    /**
     * 3.
     * HTTP Response 반환
     */
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    /**
     * Validation Error / Not Found Error 등을
     * 공통 Error Middleware로 전달한다.
     */
    next(error);
  }
};
