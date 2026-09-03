import { Router } from "express";

import {
  getMe,
  handleKakaoCallback,
  startKakaoLogin,
  logout,
} from "../controllers/auth.controller.js";

const authRouter = Router();

/**
 * 로그인 시작
 *
 * GET /api/auth/kakao/start
 */
authRouter.get("/kakao/start", startKakaoLogin);

/**
 * Kakao 로그인 완료 callback
 *
 * GET /api/auth/kakao/callback
 */
authRouter.get("/kakao/callback", handleKakaoCallback);

/**
 * 현재 로그인 사용자
 *
 * GET /api/auth/me
 */
authRouter.get("/me", getMe);

/**
 * 로그아웃
 *
 * POST /api/auth/logout
 */
authRouter.post("/logout", logout);

export { authRouter };
