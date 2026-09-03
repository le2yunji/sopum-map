import type { NextFunction, Request, Response } from "express";

import { kakaoProvider } from "../providers/auth/auth-providers.js";

import { env } from "../config/env.js";

import {
  completeOAuthLogin,
  deleteAuthSession,
  getAuthenticatedUser,
  startOAuthLogin,
} from "../services/auth/auth.service.js";

import { AUTH_SESSION_COOKIE_NAME } from "../services/auth/auth.constants.js";

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

/**
 * Kakao 로그인 완료 후 호출되는 callback
 *
 * 흐름:
 *
 * Kakao
 *   ↓
 * code + state
 *   ↓
 * completeOAuthLogin()
 *   ↓
 * sessionToken
 *   ↓
 * HttpOnly Cookie
 *   ↓
 * frontend redirect
 */
export async function handleKakaoCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    /**
     * Kakao가 callback query로 전달한
     * Authorization Code
     */
    const code =
      typeof req.query.code === "string" ? req.query.code : undefined;

    /**
     * 처음 Authorization 요청 때 우리가 보냈고
     * Kakao가 그대로 돌려준 state
     */
    const state =
      typeof req.query.state === "string" ? req.query.state : undefined;

    /**
     * code / state 둘 중 하나라도 없다면
     * 정상적인 OAuth callback이 아닙니다.
     */
    if (!code || !state) {
      res.status(400).json({
        success: false,
        message: "카카오 로그인 요청 정보가 올바르지 않습니다.",
      });

      return;
    }

    /**
     * OAuth/OIDC 검증
     * +
     * User 조회/생성
     * +
     * AuthSession 생성
     *
     * 을 Service에서 처리합니다.
     */
    const { sessionToken, sessionExpiresAt, returnTo } =
      await completeOAuthLogin(kakaoProvider, code, state);

    /**
     * Service에서 만든 원본 sessionToken을
     * 브라우저 HttpOnly Cookie로 전달합니다.
     *
     * DB에는 이 원본 값이 아니라
     * SHA-256 hash만 저장되어 있습니다.
     */
    res.cookie(AUTH_SESSION_COOKIE_NAME, sessionToken, {
      /**
       * JavaScript에서 Cookie 접근 금지
       *
       * document.cookie로 읽을 수 없습니다.
       */
      httpOnly: true,

      /**
       * HTTPS 연결에서만 Cookie 전송
       *
       * 로컬 개발 환경에서는 HTTP를 사용하므로 false
       */
      secure: env.nodeEnv === "production",

      /**
       * 일반적인 OAuth redirect 흐름에서는
       * Lax가 적절합니다.
       */
      sameSite: "lax",

      /**
       * 모든 API 경로에서 사용
       */
      path: "/",

      /**
       * AuthSession DB 만료시간과
       * Browser Cookie 만료시간을 맞춥니다.
       */
      expires: sessionExpiresAt,
    });

    /**
     * OAuthTransaction에서 보존했던 returnTo를
     * frontend origin과 결합합니다.
     *
     * 예:
     *
     * clientOrigin
     * http://localhost:3000
     *
     * returnTo
     * /map
     *
     * 결과
     * http://localhost:3000/map
     */
    const redirectUrl = new URL(returnTo, env.clientOrigin);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    /**
     * OAuth 실패 / ID Token 검증 실패 /
     * DB 오류 등은 기존 errorMiddleware로 전달
     */
    next(error);
  }
}

/**
 * 현재 로그인한 사용자 정보를 반환합니다.
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    /**
     * HttpOnly Cookie도 서버에서는 읽을 수 있습니다.
     *
     * HttpOnly의 의미는
     * "브라우저 JavaScript에서 읽지 못한다"는 뜻이지,
     * 서버가 못 읽는다는 뜻은 아닙니다.
     */
    const sessionToken = req.cookies[AUTH_SESSION_COOKIE_NAME];

    /**
     * Cookie가 없으면 로그인 상태가 아닙니다.
     */
    if (typeof sessionToken !== "string" || !sessionToken) {
      res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });

      return;
    }

    const user = await getAuthenticatedUser(sessionToken);

    /**
     * Cookie는 존재하지만 세션이 없거나 만료된 경우
     */
    if (!user) {
      res.status(401).json({
        success: false,
        message: "유효하지 않은 로그인 세션입니다.",
      });

      return;
    }

    /**
     * MongoDB 문서 전체를 그대로 보내기보다
     * 프론트가 필요한 필드만 반환합니다.
     */
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
 * 현재 로그인 세션을 종료합니다.
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    /**
     * Browser의 HttpOnly Cookie에서
     * sessionToken을 가져옵니다.
     */
    const sessionToken = req.cookies[AUTH_SESSION_COOKIE_NAME];

    /**
     * Cookie가 존재한다면
     * DB의 AuthSession도 삭제합니다.
     *
     * Cookie가 없어도 로그아웃 요청 자체는
     * 성공으로 처리합니다.
     */
    if (typeof sessionToken === "string" && sessionToken) {
      await deleteAuthSession(sessionToken);
    }

    /**
     * Browser에 저장된 Cookie 삭제
     *
     * Cookie를 만들 때 사용했던 주요 옵션과
     * 동일하게 맞춰주는 것이 중요합니다.
     */
    res.clearCookie(AUTH_SESSION_COOKIE_NAME, {
      httpOnly: true,

      secure: env.nodeEnv === "production",

      sameSite: "lax",

      path: "/",
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
