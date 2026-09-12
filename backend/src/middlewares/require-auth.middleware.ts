// src/middlewares/require-auth.middleware.ts

import type { NextFunction, Request, Response } from "express";

import { AUTH_SESSION_COOKIE_NAME } from "../services/auth/auth.constants.js";
import { getAuthenticatedUserId } from "../services/auth/auth.service.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sessionToken = req.cookies[AUTH_SESSION_COOKIE_NAME];

    if (typeof sessionToken !== "string" || !sessionToken) {
      res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });

      return;
    }

    const userId = await getAuthenticatedUserId(sessionToken);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "유효하지 않은 로그인 세션입니다.",
      });

      return;
    }

    req.auth = {
      userId,
    };

    next();
  } catch (error) {
    next(error);
  }
}
