import { Router } from "express";

import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { optionalAuth } from "../middlewares/optional-auth.middleware.js";
import {
  createShopLike,
  deleteShopLike,
} from "../controllers/shop-like.controller.js";
import {
  getShopDetailController,
  getShopsController,
} from "../controllers/shop.controller.js";

// import { optionalAuthMiddleware } from "../middlewares/optional-auth.middleware";

export const shopRouter = Router();

/*
 * GET /shops
 */
shopRouter.get("/", optionalAuth, getShopsController);

/*
 * GET /shops/:shopId
 */
shopRouter.get("/:shopId", optionalAuth, getShopDetailController);

/**
 * POST /:shopId/likes
 */
shopRouter.post("/:shopId/likes", requireAuth, createShopLike);

/**
 * DELETE /:shopId/likes
 */
shopRouter.delete("/:shopId/likes", requireAuth, deleteShopLike);
