import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

import {
  createPickFolder,
  deletePickFolder,
  getMyPickFolders,
  getShopsByFolder,
  getFolderIdsByShop,
  updatePickFolder,
  updatePickFolderOrder,
  updateFolderIdsByShop,
  addShopToFolder,
  removeShopFromFolder,
} from "../services/pick-folder/pick-folder.service.js";

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

/**
 * 내 픽 폴더 목록을 조회합니다.
 */
export async function getMyPickFoldersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const data = await getMyPickFolders(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 새 내 픽 폴더를 생성합니다.
 */
export async function createPickFolderController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const { body } = res.locals.validated as z.infer<
      typeof createPickFolderSchema
    >;

    const data = await createPickFolder(userId, body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 내 픽 폴더 정보를 수정합니다.
 */
export async function updatePickFolderController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { folderId },
      body,
    } = res.locals.validated as z.infer<typeof updatePickFolderSchema>;

    const data = await updatePickFolder(userId, folderId, body);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 내 픽 폴더를 삭제합니다.
 */
export async function deletePickFolderController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const {
      params: { folderId },
    } = res.locals.validated as z.infer<typeof deletePickFolderSchema>;

    await deletePickFolder(userId, folderId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * 내 픽 폴더 순서를 변경합니다.
 */
export async function updatePickFolderOrderController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const { body } = res.locals.validated as z.infer<
      typeof updatePickFolderOrderSchema
    >;

    await updatePickFolderOrder(userId, body);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * 특정 상점이 현재 포함되어 있는
 * 내 픽 폴더 ID 목록을 조회합니다.
 */
export async function getFolderIdsByShopController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { shopId },
    } = res.locals.validated as z.infer<typeof getShopPickFoldersSchema>;

    const data = await getFolderIdsByShop(userId, shopId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 특정 상점의 내 픽 폴더 소속을 변경합니다.
 */
export async function updateFolderIdsByShopController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { shopId },
      body,
    } = res.locals.validated as z.infer<typeof updateShopFolderIdsSchema>;

    const data = await updateFolderIdsByShop(userId, shopId, body);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 특정 내 픽 폴더에 저장된
 * 상점 목록을 조회합니다.
 */
export async function getShopsByFolderController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { folderId },
      query: { page, limit },
    } = res.locals.validated as z.infer<typeof getPickFolderShopsSchema>;

    const data = await getShopsByFolder({
      userId,
      folderId,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 좋아요한 상점을 특정 내 픽 폴더에 추가합니다.
 */
export async function addShopToFolderController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { folderId },
      body,
    } = res.locals.validated as z.infer<typeof addShopToFolderSchema>;

    const data = await addShopToFolder(userId, folderId, body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 특정 내 픽 폴더에서 상점을 제거합니다.
 */
export async function removeShopFromFolderController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { folderId, shopId },
    } = res.locals.validated as z.infer<typeof removeShopFromFolderSchema>;

    await removeShopFromFolder(userId, folderId, shopId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
