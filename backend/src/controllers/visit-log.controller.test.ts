import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  createVisitLog: vi.fn(),
  checkVisitLogAvailability: vi.fn(),
  getMyVisitLogs: vi.fn(),
  getMyVisitLog: vi.fn(),
  updateVisitLog: vi.fn(),
  deleteVisitLog: vi.fn(),
}));

vi.mock("../services/visit-log/visit-log.create.service.js", () => ({
  createVisitLog: serviceMocks.createVisitLog,
  checkVisitLogAvailability: serviceMocks.checkVisitLogAvailability,
}));

vi.mock("../services/visit-log/visit-log.manage.service.js", () => ({
  getMyVisitLogs: serviceMocks.getMyVisitLogs,
  getMyVisitLog: serviceMocks.getMyVisitLog,
  updateVisitLog: serviceMocks.updateVisitLog,
  deleteVisitLog: serviceMocks.deleteVisitLog,
}));

import {
  createVisitLogController,
  checkVisitLogAvailabilityController,
  deleteVisitLogController,
  getMyVisitLogController,
  getMyVisitLogsController,
  updateVisitLogController,
} from "./visit-log.controller.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const shopId = "6a8a68e15e2aa43be6a6549e";
const visitLogId = "6a8a68e15e2aa43be6a6549f";
const body = {
  visitedAt: "2026-10-13T03:00:00.000Z",
  selectedTagKeys: ["cute"],
  content: null,
  imageUploadIds: [],
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
  serviceMocks.checkVisitLogAvailability.mockResolvedValue({ canCreate: true });
  serviceMocks.getMyVisitLogs.mockResolvedValue({ items: [] });
  serviceMocks.getMyVisitLog.mockResolvedValue({ id: visitLogId });
  serviceMocks.updateVisitLog.mockResolvedValue({ visitLogId });
  serviceMocks.deleteVisitLog.mockResolvedValue({ visitLogId });
});

describe("방문 로그 관리 컨트롤러", () => {
  /** 관리 컨트롤러가 사용하는 인증·검증 값을 준비합니다. */
  function createManageContext(validated: unknown) {
    const request = { auth: { userId } } as Request;
    const response = {
      locals: { validated },
      status: vi.fn(),
      json: vi.fn(),
    } as unknown as Response;
    vi.mocked(response.status).mockReturnValue(response);
    const next = vi.fn() as NextFunction;
    return { request, response, next };
  }

  it("내 목록 조회에 인증 사용자와 페이지 조건을 전달한다", async () => {
    const context = createManageContext({ query: { page: 2, limit: 10 } });
    await getMyVisitLogsController(context.request, context.response, context.next);
    expect(serviceMocks.getMyVisitLogs).toHaveBeenCalledWith({ userId, page: 2, limit: 10 });
    expect(context.response.status).toHaveBeenCalledWith(200);
  });

  it("본인 로그 한 건을 조회한다", async () => {
    const context = createManageContext({ params: { visitLogId } });
    await getMyVisitLogController(context.request, context.response, context.next);
    expect(serviceMocks.getMyVisitLog).toHaveBeenCalledWith(userId, visitLogId);
  });

  it("검증된 값으로 본인 로그를 수정한다", async () => {
    const updateBody = { ...body, imageUploadIds: undefined };
    const context = createManageContext({ params: { visitLogId }, body: updateBody });
    await updateVisitLogController(context.request, context.response, context.next);
    expect(serviceMocks.updateVisitLog).toHaveBeenCalledWith(userId, visitLogId, updateBody);
  });

  it("본인 로그를 삭제하고 성공 데이터를 반환한다", async () => {
    const context = createManageContext({ params: { visitLogId } });
    await deleteVisitLogController(context.request, context.response, context.next);
    expect(serviceMocks.deleteVisitLog).toHaveBeenCalledWith(userId, visitLogId);
    expect(context.response.json).toHaveBeenCalledWith({ success: true, data: { visitLogId } });
  });
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

describe("checkVisitLogAvailabilityController", () => {
  it("검증된 상점·방문일로 중복 가능 여부를 반환한다", async () => {
    const request = { auth: { userId } } as Request;
    const response = {
      locals: {
        validated: {
          params: { shopId },
          query: { visitedAt: body.visitedAt },
        },
      },
      status: vi.fn(),
      json: vi.fn(),
    } as unknown as Response;
    vi.mocked(response.status).mockReturnValue(response);
    const next = vi.fn() as NextFunction;

    await checkVisitLogAvailabilityController(request, response, next);

    expect(serviceMocks.checkVisitLogAvailability).toHaveBeenCalledWith(
      userId,
      shopId,
      body.visitedAt,
    );
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      data: { canCreate: true },
    });
  });
});
