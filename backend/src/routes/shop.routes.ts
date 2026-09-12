import { requireAuth } from "../middlewares/require-auth.middleware.js";
import {
  createShopLike,
  deleteShopLike,
} from "../controllers/shop-like.controller.js";
import {
  getShopDetailController,
  getShopsController,
} from "../controllers/shop.controller.js";
import { Router } from "express";

// import { optionalAuthMiddleware } from "../middlewares/optional-auth.middleware";

export const shopRouter = Router();

/*
 * GET /shops
 *
 * 로그인 토큰이 없어도 접근할 수 있다.
 * 토큰이 있으면 req.user를 설정해 isLiked를 계산한다.
 */
shopRouter.get("/", getShopsController);

/*
 * GET /shops/:shopId
 */
shopRouter.get("/:shopId", getShopDetailController);

/**
 * POST /:shopId/likes
 */
shopRouter.post("/:shopId/likes", requireAuth, createShopLike);

/**
 * DELETE /:shopId/likes
 */
shopRouter.delete("/:shopId/likes", requireAuth, deleteShopLike);
