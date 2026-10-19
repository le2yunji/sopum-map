import type { UpdateVisitLogRequest } from "@sopum-map/shared";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  aggregate: vi.fn(),
  exists: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  prepareVisitLogImages: vi.fn(),
  attachVisitLogImages: vi.fn(),
  abortVisitLogImages: vi.fn(),
  deleteObject: vi.fn(),
}));

vi.mock("../../models/visit-log.model.js", () => ({
  default: modelMocks,
}));

vi.mock("../upload/upload-finalization.service.js", () => ({
  prepareVisitLogImages: modelMocks.prepareVisitLogImages,
  attachVisitLogImages: modelMocks.attachVisitLogImages,
  abortVisitLogImages: modelMocks.abortVisitLogImages,
}));

vi.mock("../upload/s3-image-storage.service.js", () => ({
  deleteVisitLogImageObject: modelMocks.deleteObject,
}));

import {
  deleteVisitLog,
  getMyVisitLog,
  getMyVisitLogs,
  updateVisitLog,
} from "./visit-log.manage.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const shopId = "6a8a68e15e2aa43be6a6549e";
const visitLogId = "6a8a68e15e2aa43be6a6549f";
const mappedItem = {
  id: visitLogId,
  shop: { id: shopId, name: "모모 소품샵", imageUrl: null, address: "서울 성동구" },
  selectedTagKeys: ["cute"],
  content: null,
  imageKeys: [],
  visitedAt: "2026-10-13T03:00:00.000Z",
  createdAt: "2026-10-13T04:00:00.000Z",
  updatedAt: "2026-10-13T04:00:00.000Z",
} as const;
const { imageKeys: _imageKeys, ...mappedItemWithoutImageKeys } = mappedItem;
const responseItem = { ...mappedItemWithoutImageKeys, images: [] };

const updateInput: UpdateVisitLogRequest = {
  visitedAt: "2026-10-14T03:00:00.000Z",
  selectedTagKeys: ["cute", "friendly"],
  content: "  다시 방문했어요.  ",
};

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.aggregate.mockResolvedValue([{ items: [mappedItem], summary: [{ totalCount: 1, uniqueShopCount: 1 }] }]);
  modelMocks.exists.mockResolvedValue(null);
  modelMocks.findOne.mockReturnValue({
    lean: vi.fn().mockResolvedValue({
      shopId: new Types.ObjectId(shopId),
      images: [],
    }),
  });
  modelMocks.findOneAndUpdate.mockResolvedValue({
    _id: new Types.ObjectId(visitLogId),
    images: [],
  });
  modelMocks.prepareVisitLogImages.mockResolvedValue({ uploads: [], images: [] });
  modelMocks.attachVisitLogImages.mockResolvedValue(undefined);
  modelMocks.abortVisitLogImages.mockResolvedValue(undefined);
  modelMocks.deleteObject.mockResolvedValue(undefined);
});

describe("getMyVisitLogs", () => {
  it("내 활성 로그와 상점 요약을 최신 방문일순으로 조회한다", async () => {
    await expect(getMyVisitLogs({ userId, page: 1, limit: 10 })).resolves.toEqual({
      items: [responseItem],
      pagination: { totalCount: 1, page: 1, limit: 10, totalPages: 1, hasNext: false },
      summary: { totalCount: 1, uniqueShopCount: 1 },
    });

    expect(modelMocks.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        { $match: { userId: new Types.ObjectId(userId), status: "active" } },
        { $sort: { visitedAt: -1, createdAt: -1, _id: -1 } },
      ]),
    );
  });
});

describe("getMyVisitLog", () => {
  it("본인 활성 로그 한 건을 반환한다", async () => {
    modelMocks.aggregate.mockResolvedValue([mappedItem]);

    await expect(getMyVisitLog(userId, visitLogId)).resolves.toEqual(responseItem);
  });

  it("본인 활성 로그가 아니면 404를 반환한다", async () => {
    modelMocks.aggregate.mockResolvedValue([]);

    await expect(getMyVisitLog(userId, visitLogId)).rejects.toMatchObject({
      status: 404,
      code: "VISIT_LOG_NOT_FOUND",
    });
  });
});

describe("updateVisitLog", () => {
  it("본인 활성 로그의 수정 가능한 값만 갱신한다", async () => {
    await expect(updateVisitLog(userId, visitLogId, updateInput)).resolves.toEqual({ visitLogId });

    expect(modelMocks.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: new Types.ObjectId(visitLogId), userId: new Types.ObjectId(userId), status: "active" },
      { $set: expect.objectContaining({ visitedDate: "2026-10-14", content: "다시 방문했어요." }) },
      { new: true },
    );
  });

  it("같은 상점·날짜의 다른 활성 로그가 있으면 409를 반환한다", async () => {
    modelMocks.exists.mockResolvedValue({ _id: new Types.ObjectId() });

    await expect(updateVisitLog(userId, visitLogId, updateInput)).rejects.toMatchObject({
      status: 409,
      code: "VISIT_LOG_ALREADY_EXISTS",
    });
  });

  it("기존 이미지 순서를 유지하며 새 업로드를 원하는 위치에 추가한다", async () => {
    const existingKey = `visit-logs/${userId}/existing.webp`;
    const newKey = `visit-logs/${userId}/new.webp`;
    const uploadId = "6a8a68e15e2aa43be6a654a0";
    modelMocks.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        shopId: new Types.ObjectId(shopId),
        images: [{ key: existingKey }],
      }),
    });
    modelMocks.prepareVisitLogImages.mockResolvedValue({
      uploads: [{ id: new Types.ObjectId(uploadId) }],
      images: [{ key: newKey }],
    });

    await updateVisitLog(userId, visitLogId, {
      ...updateInput,
      images: [
        { type: "new", uploadId },
        { type: "existing", key: existingKey },
      ],
    });

    expect(modelMocks.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: expect.objectContaining({
          images: [{ key: newKey }, { key: existingKey }],
        }),
      },
      { new: true },
    );
  });

  it("현재 로그에 속하지 않은 기존 이미지 키를 거부한다", async () => {
    await expect(
      updateVisitLog(userId, visitLogId, {
        ...updateInput,
        images: [{ type: "existing", key: "visit-logs/other/image.webp" }],
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_VISIT_LOG_IMAGE",
    });
    expect(modelMocks.prepareVisitLogImages).not.toHaveBeenCalled();
  });

  it("본인 활성 로그가 아니면 404를 반환한다", async () => {
    modelMocks.findOneAndUpdate.mockResolvedValue(null);

    await expect(updateVisitLog(userId, visitLogId, updateInput)).rejects.toMatchObject({
      status: 404,
      code: "VISIT_LOG_NOT_FOUND",
    });
  });
});

describe("deleteVisitLog", () => {
  it("본인 활성 로그를 소프트 삭제한다", async () => {
    await expect(deleteVisitLog(userId, visitLogId)).resolves.toEqual({ visitLogId });
    expect(modelMocks.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: new Types.ObjectId(visitLogId), userId: new Types.ObjectId(userId), status: "active" },
      { $set: { status: "deleted" } },
      { new: true },
    );
  });


  it("소프트 삭제가 확정된 뒤 연결된 S3 이미지를 정리한다", async () => {
    const key = `visit-logs/${userId}/image.webp`;
    modelMocks.findOneAndUpdate.mockResolvedValue({
      _id: new Types.ObjectId(visitLogId),
      images: [{ key }],
    });

    await deleteVisitLog(userId, visitLogId);

    expect(modelMocks.deleteObject).toHaveBeenCalledWith(key);
  });
});
