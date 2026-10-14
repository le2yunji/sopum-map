import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  createVisitLog: vi.fn(),
}));

vi.mock("../services/visit-log/visit-log.create.service.js", () => ({
  createVisitLog: serviceMocks.createVisitLog,
}));

import { createVisitLogController } from "./visit-log.controller.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const shopId = "6a8a68e15e2aa43be6a6549e";
const visitLogId = "6a8a68e15e2aa43be6a6549f";
const body = {
  visitedAt: "2026-10-13T03:00:00.000Z",
  selectedTagKeys: ["cute"],
  content: null,
  imageKeys: [],
} as const;

/** 생성 컨트롤러 호출에 필요한 Express 객체를 준비합니다. */
function createControllerContext() {
  const request = { auth: { userId } } as Request;
  const response = {
    locals: { validated: { params: { shopId }, body } },
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;
  vi.mocked(response.status).mockReturnValue(response);
  const next = vi.fn() as NextFunction;

  return { request, response, next };
}

beforeEach(() => {
  vi.clearAllMocks();
  serviceMocks.createVisitLog.mockResolvedValue({ visitLogId });
});

describe("createVisitLogController", () => {
  it("검증된 요청으로 방문 로그를 만들고 201 응답을 반환한다", async () => {
    const { request, response, next } = createControllerContext();

    await createVisitLogController(request, response, next);

    expect(serviceMocks.createVisitLog).toHaveBeenCalledWith(userId, shopId, body);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      data: { visitLogId },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("서비스 오류를 공통 오류 처리기로 전달한다", async () => {
    const error = new Error("create failed");
    serviceMocks.createVisitLog.mockRejectedValue(error);
    const { request, response, next } = createControllerContext();

    await createVisitLogController(request, response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.status).not.toHaveBeenCalled();
  });
});
