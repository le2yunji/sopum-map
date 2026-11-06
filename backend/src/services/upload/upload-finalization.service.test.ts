import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOneAndUpdate: vi.fn(),
  updateMany: vi.fn(),
  inspect: vi.fn(),
  copy: vi.fn(),
  deleteObject: vi.fn(),
}));

vi.mock("../../models/upload-asset.model.js", () => ({
  default: {
    findOneAndUpdate: mocks.findOneAndUpdate,
    updateMany: mocks.updateMany,
  },
}));

vi.mock("./s3-image-storage.service.js", () => ({
  inspectTemporaryVisitLogImage: mocks.inspect,
  copyVisitLogImage: mocks.copy,
  deleteVisitLogImageObject: mocks.deleteObject,
}));

import {
  attachVisitLogImages,
  prepareVisitLogImages,
} from "./upload-finalization.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const uploadId = "6a8a68e15e2aa43be6a6549e";
const visitLogId = new Types.ObjectId("6a8a68e15e2aa43be6a6549f");
const asset = {
  _id: new Types.ObjectId(uploadId),
  temporaryKey: `temporary/${userId}/file.webp`,
  finalKey: `visit-logs/${userId}/file.webp`,
  expectedSize: 2048,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findOneAndUpdate.mockReturnValue({
    lean: vi.fn().mockResolvedValue(asset),
  });
  mocks.inspect.mockResolvedValue({
    contentLength: 2048,
    contentType: "image/webp",
    uploadId,
    hasWebpSignature: true,
  });
  mocks.copy.mockResolvedValue(undefined);
  mocks.deleteObject.mockResolvedValue(undefined);
  mocks.updateMany.mockResolvedValue({ modifiedCount: 1 });
});

describe("prepareVisitLogImages", () => {
  it("본인의 pending 업로드만 선점하고 실제 WebP를 최종 경로로 복사한다", async () => {
    const result = await prepareVisitLogImages(userId, [uploadId]);

    expect(result.images).toEqual([{ key: asset.finalKey }]);
    expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: new Types.ObjectId(uploadId),
        userId: new Types.ObjectId(userId),
        status: "pending",
      },
      expect.any(Object),
      { new: true },
    );
    expect(mocks.copy).toHaveBeenCalledWith(
      asset.temporaryKey,
      asset.finalKey,
    );
  });

  it("타인 소유이거나 이미 연결된 업로드 ID를 같은 오류로 거부한다", async () => {
    mocks.findOneAndUpdate.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(prepareVisitLogImages(userId, [uploadId])).rejects.toMatchObject(
      { status: 400, code: "INVALID_IMAGE_UPLOAD" },
    );
    expect(mocks.inspect).not.toHaveBeenCalled();
  });

  it("S3 객체의 크기·형식·uploadId가 다르면 선점을 되돌린다", async () => {
    mocks.inspect.mockResolvedValue({
      contentLength: 2048,
      contentType: "image/webp",
      uploadId: "different-upload",
      hasWebpSignature: true,
    });

    await expect(prepareVisitLogImages(userId, [uploadId])).rejects.toMatchObject(
      { status: 400, code: "INVALID_IMAGE_UPLOAD" },
    );
    expect(mocks.copy).not.toHaveBeenCalled();
    expect(mocks.updateMany).toHaveBeenCalledWith(
      { _id: { $in: [asset._id] }, status: "finalizing" },
      { $set: expect.objectContaining({ status: "pending" }) },
    );
  });
});

describe("attachVisitLogImages", () => {
  it("방문 로그 연결 상태를 확정한 뒤 임시 객체를 삭제한다", async () => {
    const prepared = await prepareVisitLogImages(userId, [uploadId]);

    await attachVisitLogImages(prepared, visitLogId);

    expect(mocks.updateMany).toHaveBeenLastCalledWith(
      { _id: { $in: [asset._id] }, status: "finalizing" },
      {
        $set: expect.objectContaining({
          status: "attached",
          visitLogId,
        }),
      },
    );
    expect(mocks.deleteObject).toHaveBeenCalledWith(asset.temporaryKey);
  });
});
