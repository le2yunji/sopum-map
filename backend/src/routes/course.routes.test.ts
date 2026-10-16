import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApiError } from "@sopum-map/shared";

const serviceMocks = vi.hoisted(() => ({
  getAuthenticatedUserId: vi.fn(),
  createCourse: vi.fn(),
  setCourseShopVisited: vi.fn(),
  unsetCourseShopVisited: vi.fn(),
}));

vi.mock("../services/auth/auth.service.js", () => ({
  getAuthenticatedUserId: serviceMocks.getAuthenticatedUserId,
}));

vi.mock("../services/course/course.create.service.js", () => ({
  createCourse: serviceMocks.createCourse,
}));

vi.mock("../services/course/course-shop-visit.service.js", () => ({
  setCourseShopVisited: serviceMocks.setCourseShopVisited,
  unsetCourseShopVisited: serviceMocks.unsetCourseShopVisited,
}));

import { errorMiddleware } from "../middlewares/error.middleware.js";
import { courseRouter } from "./course.routes.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const folderId = "6a8a68e15e2aa43be6a6549e";
const courseId = "6a8a68e15e2aa43be6a6549f";
const shopId = "6a8a68e15e2aa43be6a654a0";

const validBody = {
  sourceFolderId: folderId,
  regionGroup: "seongsu-seoulforest",
  title: "성수 소품 산책",
  isPublic: false,
  shops: [
    { shopId: "6a8a68e15e2aa43be6a654a0", order: 1 },
    { shopId: "6a8a68e15e2aa43be6a654a1", order: 2 },
  ],
};

/** 코스 라우터의 인증·검증·오류 응답을 함께 확인하는 테스트 앱입니다. */
function createTestApp() {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/courses", courseRouter);
  app.use(errorMiddleware);

  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  serviceMocks.getAuthenticatedUserId.mockResolvedValue(userId);
  serviceMocks.createCourse.mockResolvedValue({ courseId });
  serviceMocks.setCourseShopVisited.mockResolvedValue({ isVisited: true });
  serviceMocks.unsetCourseShopVisited.mockResolvedValue({ isVisited: false });
});

describe("/api/courses/:courseId/shops/:shopId/visit", () => {
  it.each([
    ["put", true, "setCourseShopVisited"],
    ["delete", false, "unsetCourseShopVisited"],
  ] as const)("%s 요청으로 방문 상태 %s를 보장한다", async (method, isVisited, serviceName) => {
    const response = await request(createTestApp())
      [method](`/api/courses/${courseId}/shops/${shopId}/visit`)
      .set("Cookie", "auth_session=test-session");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: { isVisited } });
    expect(serviceMocks[serviceName]).toHaveBeenCalledWith(userId, courseId, shopId);
  });

  it("미인증 방문 저장 요청을 거부한다", async () => {
    const response = await request(createTestApp()).put(
      `/api/courses/${courseId}/shops/${shopId}/visit`,
    );

    expect(response.status).toBe(401);
    expect(serviceMocks.setCourseShopVisited).not.toHaveBeenCalled();
  });
});

describe("POST /api/courses", () => {
  it("미인증 요청에 401을 반환합니다", async () => {
    const response = await request(createTestApp())
      .post("/api/courses")
      .send(validBody);

    expect(response.status).toBe(401);
    expect(serviceMocks.createCourse).not.toHaveBeenCalled();
  });

  it("regionGroup이 없는 요청을 서비스 호출 전에 거부합니다", async () => {
    const { regionGroup: _regionGroup, ...bodyWithoutRegionGroup } = validBody;

    const response = await request(createTestApp())
      .post("/api/courses")
      .set("Cookie", "auth_session=test-session")
      .send(bodyWithoutRegionGroup);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
    expect(serviceMocks.createCourse).not.toHaveBeenCalled();
  });

  it("검증된 지역 기반 코스를 생성하고 새 courseId를 반환합니다", async () => {
    const response = await request(createTestApp())
      .post("/api/courses")
      .set("Cookie", "auth_session=test-session")
      .send(validBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: { courseId },
    });
    expect(serviceMocks.createCourse).toHaveBeenCalledWith(userId, validBody);
  });

  it("다른 사용자의 폴더 접근 오류를 403 응답으로 전달합니다", async () => {
    serviceMocks.createCourse.mockRejectedValue(
      createApiError({
        status: 403,
        code: "PICK_FOLDER_FORBIDDEN",
        message: "다른 사용자의 내 픽 폴더에는 접근할 수 없습니다.",
      }),
    );

    const response = await request(createTestApp())
      .post("/api/courses")
      .set("Cookie", "auth_session=test-session")
      .send(validBody);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "PICK_FOLDER_FORBIDDEN" },
    });
  });
});
