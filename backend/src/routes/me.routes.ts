import { Router } from "express";

import { getMyLikedShopsController } from "../controllers/me.controller.js";

import {
  createPickFolderController,
  deletePickFolderController,
  getMyPickFoldersController,
  getFolderIdsByShopController,
  updateFolderIdsByShopController,
  getShopsByFolderController,
  updatePickFolderController,
  updatePickFolderOrderController,
  addShopToFolderController,
  removeShopFromFolderController,
} from "../controllers/pick-folder.controller.js";

import { requireAuth } from "../middlewares/require-auth.middleware.js";

import { validateRequest } from "../middlewares/validate-request.middleware.js";
import {
  createPickFolderSchema,
  deletePickFolderSchema,
  getPickFolderShopsSchema,
  getShopPickFoldersSchema,
  updatePickFolderOrderSchema,
  updatePickFolderSchema,
  updateShopFolderIdsSchema,
  addShopToFolderSchema,
  removeShopFromFolderSchema,
} from "../validations/pick-folder.validation.js";

const meRouter = Router();

/**
 * 내가 좋아요한 전체 상점 목록
 *
 * GET /api/me/liked-shops
 */
meRouter.get("/liked-shops", requireAuth, getMyLikedShopsController);

/**
 * 특정 상점이 현재 포함된 내 픽 폴더 조회
 *
 * GET /api/me/liked-shops/:shopId/folders
 */
meRouter.get(
  "/liked-shops/:shopId/folders",
  requireAuth,
  validateRequest(getShopPickFoldersSchema),
  getFolderIdsByShopController,
);

/**
 * 특정 상점의 내 픽 폴더 소속 변경
 *
 * PUT /api/me/liked-shops/:shopId/folders
 */
meRouter.put(
  "/liked-shops/:shopId/folders",
  requireAuth,
  validateRequest(updateShopFolderIdsSchema),
  updateFolderIdsByShopController,
);

/**
 * 내 픽 폴더 목록
 *
 * GET /api/me/pick-folders
 */
meRouter.get("/pick-folders", requireAuth, getMyPickFoldersController);

/**
 * 새 내 픽 폴더 생성
 *
 * POST /api/me/pick-folders
 */
meRouter.post(
  "/pick-folders",
  requireAuth,
  validateRequest(createPickFolderSchema),
  createPickFolderController,
);

/**
 * 내 픽 폴더 순서 변경
 *
 * PATCH /api/me/pick-folders/order
 */
meRouter.patch(
  "/pick-folders/order",
  requireAuth,
  validateRequest(updatePickFolderOrderSchema),
  updatePickFolderOrderController,
);

/**
 * 내 픽 폴더 정보 수정
 *
 * PATCH /api/me/pick-folders/:folderId
 */
meRouter.patch(
  "/pick-folders/:folderId",
  requireAuth,
  validateRequest(updatePickFolderSchema),
  updatePickFolderController,
);

/**
 * 내 픽 폴더 삭제
 *
 * DELETE /api/me/pick-folders/:folderId
 */
meRouter.delete(
  "/pick-folders/:folderId",
  requireAuth,
  validateRequest(deletePickFolderSchema),
  deletePickFolderController,
);

/**
 * 좋아요한 상점을 특정 내 픽 폴더에 추가
 *
 * POST /api/me/pick-folders/:folderId/shops
 */
meRouter.post(
  "/pick-folders/:folderId/shops",
  requireAuth,
  validateRequest(addShopToFolderSchema),
  addShopToFolderController,
);

/**
 * 특정 내 픽 폴더의 상점 목록 조회
 *
 * GET /api/me/pick-folders/:folderId/shops
 */
meRouter.get(
  "/pick-folders/:folderId/shops",
  requireAuth,
  validateRequest(getPickFolderShopsSchema),
  getShopsByFolderController,
);

/**
 * 특정 내 픽 폴더에서 상점 제거
 *
 * DELETE /api/me/pick-folders/:folderId/shops/:shopId
 */
meRouter.delete(
  "/pick-folders/:folderId/shops/:shopId",
  requireAuth,
  validateRequest(removeShopFromFolderSchema),
  removeShopFromFolderController,
);

export { meRouter };
