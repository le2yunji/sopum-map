import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUserId: vi.fn(),
  createVisitLogImageUpload: vi.fn(),
}));

vi.mock("../services/auth/auth.service.js", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("../services/upload/upload.service.js", () => ({
  createVisitLogImageUpload: mocks.createVisitLogImageUpload,
}));

import { errorMiddleware } from "../middlewares/error.middleware.js";
import { uploadRouter } from "./upload.routes.js";

const userId = "6a8a68e15e2aa43be6a6549d";

/** 업로드 라우터의 인증과 검증을 실제 미들웨어 흐름으로 확인합니다. */
function createTestApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/uploads", uploadRouter);
  app.use(errorMiddleware);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthenticatedUserId.mockResolvedValue(userId);
  mocks.createVisitLogImageUpload.mockResolvedValue({
    uploadId: "6a8a68e15e2aa43be6a6549e",
    url: "https://s3.example.com",
    fields: { key: "temporary/user/image.webp" },
    expiresIn: 300,
  });
});

describe("POST /api/uploads/presign", () => {
  it("미인증 요청을 거부한다", async () => {
    const response = await request(createTestApp())
      .post("/api/uploads/presign")
      .send({ contentType: "image/webp", fileSize: 1024 });

    expect(response.status).toBe(401);
    expect(mocks.createVisitLogImageUpload).not.toHaveBeenCalled();
  });

  it("WebP가 아닌 요청을 서비스 호출 전에 거부한다", async () => {
    const response = await request(createTestApp())
      .post("/api/uploads/presign")
      .set("Cookie", "auth_session=test")
      .send({ contentType: "image/jpeg", fileSize: 1024 });

    expect(response.status).toBe(400);
    expect(mocks.createVisitLogImageUpload).not.toHaveBeenCalled();
  });

  it("검증된 사용자와 파일 정보로 업로드 서명을 발급한다", async () => {
    const body = { contentType: "image/webp", fileSize: 1024 };
    const response = await request(createTestApp())
      .post("/api/uploads/presign")
      .set("Cookie", "auth_session=test")
      .send(body);

    expect(response.status).toBe(201);
    expect(mocks.createVisitLogImageUpload).toHaveBeenCalledWith(userId, body);
  });
});
