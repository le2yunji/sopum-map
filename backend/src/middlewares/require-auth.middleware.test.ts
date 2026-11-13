import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("../services/auth/auth.service.js", () => ({
  getAuthenticatedUserId: authMocks.getAuthenticatedUserId,
}));

import { errorMiddleware } from "./error.middleware.js";
import { requireAuth } from "./require-auth.middleware.js";

/** 인증 미들웨어의 성공과 오류 응답을 확인할 최소 앱을 만듭니다. */
function createTestApp() {
  const app = express();

  app.use(cookieParser());
  app.get("/private", requireAuth, (req, res) => {
    res.status(200).json({ userId: req.auth?.userId });
  });
  app.use(errorMiddleware);

  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAuth", () => {
  it("로그인 쿠키가 없으면 공통 401 오류를 반환한다", async () => {
    const response = await request(createTestApp()).get("/private");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "AUTH_REQUIRED",
        message: "로그인이 필요합니다.",
      },
    });
  });

  it("세션이 유효하지 않으면 공통 401 오류를 반환한다", async () => {
    authMocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await request(createTestApp())
      .get("/private")
      .set("Cookie", "auth_session=invalid-session");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_AUTH_SESSION",
        message: "유효하지 않은 로그인 세션입니다.",
      },
    });
  });

  it("유효한 세션의 사용자 ID를 다음 처리로 전달한다", async () => {
    authMocks.getAuthenticatedUserId.mockResolvedValue("user-1");

    const response = await request(createTestApp())
      .get("/private")
      .set("Cookie", "auth_session=valid-session");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: "user-1" });
  });
});
