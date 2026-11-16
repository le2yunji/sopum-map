import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUserId: vi.fn(),
  getMyActivitySummary: vi.fn(),
  getMyVisitedShops: vi.fn(),
}));

vi.mock("../services/auth/auth.service.js", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("../services/user/user-activity.service.js", () => ({
  getMyActivitySummary: mocks.getMyActivitySummary,
}));

vi.mock("../services/user/user-visited-shop.service.js", () => ({
  getMyVisitedShops: mocks.getMyVisitedShops,
}));

import { errorMiddleware } from "../middlewares/error.middleware.js";
import { meRouter } from "./me.routes.js";

const userId = "6a8a68e15e2aa43be6a6549d";

/** 내 정보 라우터의 인증과 공통 응답 형식을 함께 확인합니다. */
function createTestApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/me", meRouter);
  app.use(errorMiddleware);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthenticatedUserId.mockResolvedValue(userId);
  mocks.getMyActivitySummary.mockResolvedValue({
    createdCourseCount: 2,
    visitLogCount: 4,
    visitedShopCount: 3,
  });
  mocks.getMyVisitedShops.mockResolvedValue({
    items: [],
    pagination: {
      totalCount: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
      hasNext: false,
    },
  });
});

describe("GET /api/me/visited-shops", () => {
  it("인증된 사용자의 방문 상점을 페이지로 반환한다", async () => {
    const response = await request(createTestApp())
      .get("/api/me/visited-shops?page=2&limit=5")
      .set("Cookie", "auth_session=test-session");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [],
        pagination: {
          totalCount: 0,
          page: 2,
          limit: 5,
          totalPages: 0,
          hasNext: false,
        },
      },
    });
    expect(mocks.getMyVisitedShops).toHaveBeenCalledWith({
      userId,
      page: 2,
      limit: 5,
    });
  });

  it("비로그인 사용자의 요청을 거부한다", async () => {
    const response = await request(createTestApp()).get(
      "/api/me/visited-shops",
    );

    expect(response.status).toBe(401);
    expect(mocks.getMyVisitedShops).not.toHaveBeenCalled();
  });

  it("범위를 벗어난 페이지 요청을 거부한다", async () => {
    const response = await request(createTestApp())
      .get("/api/me/visited-shops?limit=51")
      .set("Cookie", "auth_session=test-session");

    expect(response.status).toBe(400);
    expect(mocks.getMyVisitedShops).not.toHaveBeenCalled();
  });
});

describe("GET /api/me/activity-summary", () => {
  it("인증된 사용자의 활동 요약을 반환한다", async () => {
    const response = await request(createTestApp())
      .get("/api/me/activity-summary")
      .set("Cookie", "auth_session=test-session");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        createdCourseCount: 2,
        visitLogCount: 4,
        visitedShopCount: 3,
      },
    });
    expect(mocks.getMyActivitySummary).toHaveBeenCalledWith(userId);
  });

  it("비로그인 사용자의 요청을 거부한다", async () => {
    const response = await request(createTestApp()).get(
      "/api/me/activity-summary",
    );

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "AUTH_REQUIRED" },
    });
    expect(mocks.getMyActivitySummary).not.toHaveBeenCalled();
  });
});
