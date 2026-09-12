import { Router } from "express";

import { getMyLikedShops } from "../controllers/me.controller.js";
import { requireAuth } from "../middlewares/require-auth.middleware.js";

const meRouter = Router();

/**
 * 내가 좋아요한 상점 목록
 *
 * GET /api/me/liked-shops
 */
meRouter.get("/liked-shops", requireAuth, getMyLikedShops);

export { meRouter };
