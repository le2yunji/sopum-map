import type { NextFunction, Request, Response } from "express";

import { kakaoProvider } from "../providers/auth/auth-providers.js";
import { startOAuthLogin } from "../services/auth/auth.service.js";

export async function startKakaoLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const returnTo =
      typeof req.query.returnTo === "string" ? req.query.returnTo : undefined;

    const authorizationUrl = await startOAuthLogin(kakaoProvider, returnTo);

    res.redirect(authorizationUrl);
  } catch (error) {
    next(error);
  }
}
