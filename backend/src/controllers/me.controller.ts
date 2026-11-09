import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { getLikedShops } from "../services/shop-like.service.js";
import { likedShopsQuerySchema } from "../validations/shop-like.validation.js";
import UserModel from "../models/user.model.js";
import { updateUserProfile } from "../services/user/user.service.js";
import { updateMyProfileSchema } from "../validations/me.validation.js";

/**
 * 현재 로그인한 사용자 정보를 반환합니다.
 */
export async function getMeController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });

      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        nickname: user.nickname,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 현재 로그인한 사용자의 프로필을 수정합니다.
 */
export async function updateMyProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const { body } = res.locals.validated as z.infer<
      typeof updateMyProfileSchema
    >;

    const data = await updateUserProfile(userId, body);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 내가 좋아요한 전체 상점 목록을 반환합니다.
 */
export async function getMyLikedShopsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const { page, limit } = likedShopsQuerySchema.parse(req.query);

    const result = await getLikedShops({
      userId,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
