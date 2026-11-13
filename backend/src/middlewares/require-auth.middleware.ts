// src/middlewares/require-auth.middleware.ts

import type { NextFunction, Request, Response } from "express";

import { AUTH_SESSION_COOKIE_NAME } from "../services/auth/auth.constants.js";
import { getAuthenticatedUserId } from "../services/auth/auth.service.js";
import { createApiError } from "@sopum-map/shared";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const sessionToken = req.cookies[AUTH_SESSION_COOKIE_NAME];

    if (typeof sessionToken !== "string" || !sessionToken) {
      throw createApiError({
        status: 401,
        code: "AUTH_REQUIRED",
        message: "로그인이 필요합니다.",
      });
    }

    const userId = await getAuthenticatedUserId(sessionToken);

    if (!userId) {
      throw createApiError({
        status: 401,
        code: "INVALID_AUTH_SESSION",
        message: "유효하지 않은 로그인 세션입니다.",
      });
    }

    req.auth = {
      userId,
    };

    next();
  } catch (error) {
    next(error);
  }
}
