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
import {
  checkVisitLogAvailabilityController,
  createVisitLogController,
  getVisitLogsController,
} from "../controllers/visit-log.controller.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import {
  checkVisitLogAvailabilitySchema,
  createVisitLogSchema,
} from "../validations/visit-log.validation.js";

export const shopRouter = Router();

/*
 * GET /shops
 */
shopRouter.get("/", optionalAuth, getShopsController);

/*
 * GET /shops/:shopId
 */
shopRouter.get("/:shopId", optionalAuth, getShopDetailController);

/*
 * GET /shops/:shopId/visit-logs
 */
shopRouter.get("/:shopId/visit-logs", optionalAuth, getVisitLogsController);

/*
 * GET /shops/:shopId/visit-logs/availability
 */
shopRouter.get(
  "/:shopId/visit-logs/availability",
  requireAuth,
  validateRequest(checkVisitLogAvailabilitySchema),
  checkVisitLogAvailabilityController,
);

/*
 * POST /shops/:shopId/visit-logs
 */
shopRouter.post(
  "/:shopId/visit-logs",
  requireAuth,
  validateRequest(createVisitLogSchema),
  createVisitLogController,
);

/**
 * POST /:shopId/likes
 */
shopRouter.post("/:shopId/likes", requireAuth, createShopLike);

/**
 * DELETE /:shopId/likes
 */
shopRouter.delete("/:shopId/likes", requireAuth, deleteShopLike);
