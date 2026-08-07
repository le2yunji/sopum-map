import { Router } from "express";

import {
  getShopDetailController,
  getShopListController,
} from "../controllers/shop.controller";
// import { optionalAuthMiddleware } from "../middlewares/optional-auth.middleware";

export const shopRouter = Router();

/*
 * GET /shops
 *
 * 로그인 토큰이 없어도 접근할 수 있다.
 * 토큰이 있으면 req.user를 설정해 isLiked를 계산한다.
 */
shopRouter.get("/", getShopListController);

/*
 * GET /shops/:shopId
 */
shopRouter.get("/:shopId", getShopDetailController);
