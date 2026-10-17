import type { CreateVisitLogRequest } from "@sopum-map/shared";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findShop: vi.fn(),
  findDuplicateVisitLog: vi.fn(),
  createVisitLog: vi.fn(),
}));

vi.mock("../../models/shop.model.js", () => ({
  default: { exists: modelMocks.findShop },
}));

vi.mock("../../models/visit-log.model.js", () => ({
  default: {
    exists: modelMocks.findDuplicateVisitLog,
    create: modelMocks.createVisitLog,
  },
}));

import {
  checkVisitLogAvailability,
  createVisitLog,
} from "./visit-log.create.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const shopId = "6a8a68e15e2aa43be6a6549e";
const visitLogId = "6a8a68e15e2aa43be6a6549f";

const input: CreateVisitLogRequest = {
  visitedAt: "2026-10-13T03:00:00.000Z",
  selectedTagKeys: ["cute", "friendly"],
  content: "  다시 방문하고 싶은 상점이에요.  ",
  imageKeys: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findShop.mockResolvedValue({ _id: new Types.ObjectId(shopId) });
  modelMocks.findDuplicateVisitLog.mockResolvedValue(null);
  modelMocks.createVisitLog.mockResolvedValue({
    _id: new Types.ObjectId(visitLogId),
  });
});

describe("createVisitLog", () => {
  it("활성 상점에 이미지 없는 공개 방문 로그를 생성한다", async () => {
    await expect(createVisitLog(userId, shopId, input)).resolves.toEqual({
      visitLogId,
    });

    expect(modelMocks.findShop).toHaveBeenCalledWith({
      _id: new Types.ObjectId(shopId),
      status: "active",
    });
    expect(modelMocks.createVisitLog).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      shopId: new Types.ObjectId(shopId),
      visitedAt: new Date(input.visitedAt),
      visitedDate: "2026-10-13",
      selectedTagKeys: input.selectedTagKeys,
      content: "다시 방문하고 싶은 상점이에요.",
      imageKeys: [],
      status: "active",
    });
  });

  it("같은 사용자의 같은 상점·한국 날짜 활성 로그를 거부한다", async () => {
    modelMocks.findDuplicateVisitLog.mockResolvedValue({ _id: visitLogId });

    await expect(createVisitLog(userId, shopId, input)).rejects.toMatchObject({
      status: 409,
      code: "VISIT_LOG_ALREADY_EXISTS",
    });
    expect(modelMocks.findDuplicateVisitLog).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      shopId: new Types.ObjectId(shopId),
      visitedDate: "2026-10-13",
      status: "active",
    });
    expect(modelMocks.createVisitLog).not.toHaveBeenCalled();
  });

  it("다른 한국 날짜의 방문 로그는 허용한다", async () => {
    await createVisitLog(userId, shopId, {
      ...input,
      visitedAt: "2026-10-13T15:00:00.000Z",
    });

    expect(modelMocks.findDuplicateVisitLog).toHaveBeenCalledWith(
      expect.objectContaining({ visitedDate: "2026-10-14" }),
    );
    expect(modelMocks.createVisitLog).toHaveBeenCalledOnce();
  });

  it("동시 생성의 고유 인덱스 충돌을 중복 방문 로그 오류로 변환한다", async () => {
    modelMocks.createVisitLog.mockRejectedValue({ code: 11000 });

    await expect(createVisitLog(userId, shopId, input)).rejects.toMatchObject({
      status: 409,
      code: "VISIT_LOG_ALREADY_EXISTS",
    });
  });

  it("활성 상태가 아닌 상점에는 방문 로그를 만들 수 없다", async () => {
    modelMocks.findShop.mockResolvedValue(null);

    await expect(createVisitLog(userId, shopId, input)).rejects.toMatchObject({
      status: 404,
      code: "SHOP_NOT_FOUND",
    });
    expect(modelMocks.createVisitLog).not.toHaveBeenCalled();
  });

  it("활성 공용 정의에 없는 태그를 거부한다", async () => {
    const invalidInput = {
      ...input,
      selectedTagKeys: ["disabled_tag"],
    } as unknown as CreateVisitLogRequest;

    await expect(
      createVisitLog(userId, shopId, invalidInput),
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_VISIT_LOG_TAG",
    });
    expect(modelMocks.createVisitLog).not.toHaveBeenCalled();
  });

  it("S3 도입 전에는 이미지 키가 있는 요청을 거부한다", async () => {
    await expect(
      createVisitLog(userId, shopId, {
        ...input,
        imageKeys: ["visit-logs/user/image.webp"],
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: "VISIT_LOG_IMAGE_NOT_SUPPORTED",
    });
    expect(modelMocks.createVisitLog).not.toHaveBeenCalled();
  });

  it("공백으로만 작성한 방문 글은 null로 저장한다", async () => {
    await createVisitLog(userId, shopId, { ...input, content: "   " });

    expect(modelMocks.createVisitLog).toHaveBeenCalledWith(
      expect.objectContaining({ content: null }),
    );
  });
});

describe("checkVisitLogAvailability", () => {
  it("같은 상점·한국 날짜의 활성 로그가 없으면 작성 가능하다", async () => {
    await expect(
      checkVisitLogAvailability(userId, shopId, input.visitedAt),
    ).resolves.toEqual({ canCreate: true });
  });

  it("같은 상점·한국 날짜의 활성 로그가 있으면 작성할 수 없다", async () => {
    modelMocks.findDuplicateVisitLog.mockResolvedValue({ _id: visitLogId });

    await expect(
      checkVisitLogAvailability(userId, shopId, input.visitedAt),
    ).resolves.toEqual({ canCreate: false });
  });
});
