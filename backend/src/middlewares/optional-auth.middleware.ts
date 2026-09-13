// src/middlewares/optional-auth.middleware.ts

import type { NextFunction, Request, Response } from "express";

import { AUTH_SESSION_COOKIE_NAME } from "../services/auth/auth.constants.js";
import { getAuthenticatedUserId } from "../services/auth/auth.service.js";

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const sessionToken = req.cookies[AUTH_SESSION_COOKIE_NAME];

    if (typeof sessionToken !== "string" || !sessionToken) {
      next();

      return;
    }

    const userId = await getAuthenticatedUserId(sessionToken);

    if (userId) {
      req.auth = {
        userId,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}
