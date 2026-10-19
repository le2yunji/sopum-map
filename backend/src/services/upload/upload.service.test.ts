import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  countDocuments: vi.fn(),
  create: vi.fn(),
  deleteOne: vi.fn(),
  createPresignedPost: vi.fn(),
}));

vi.mock("../../models/upload-asset.model.js", () => ({
  default: {
    countDocuments: mocks.countDocuments,
    create: mocks.create,
    deleteOne: mocks.deleteOne,
  },
}));

vi.mock("./s3-image-storage.service.js", () => ({
  createVisitLogImagePresignedPost: mocks.createPresignedPost,
}));

import { createVisitLogImageUpload } from "./upload.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const uploadId = "6a8a68e15e2aa43be6a6549e";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.countDocuments.mockResolvedValue(0);
  mocks.create.mockImplementation(async (input) => ({
    ...input,
    _id: new Types.ObjectId(uploadId),
  }));
  mocks.createPresignedPost.mockResolvedValue({
    url: "https://sopummap-images.s3.amazonaws.com/",
    fields: { key: "temporary-key", policy: "policy" },
  });
  mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
});

describe("createVisitLogImageUpload", () => {
  it("서버가 정한 임시·최종 키로 업로드 서명을 발급한다", async () => {
    const result = await createVisitLogImageUpload(userId, {
      contentType: "image/webp",
      fileSize: 2048,
    });

    expect(result).toMatchObject({
      uploadId,
      url: "https://sopummap-images.s3.amazonaws.com/",
      expiresIn: 300,
    });
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: new Types.ObjectId(userId),
        temporaryKey: expect.stringMatching(
          new RegExp(`^temporary/${userId}/[0-9a-f-]+\\.webp$`),
        ),
        finalKey: expect.stringMatching(
          new RegExp(`^visit-logs/${userId}/[0-9a-f-]+\\.webp$`),
        ),
        expectedSize: 2048,
        contentType: "image/webp",
        status: "pending",
      }),
    );
  });

  it("미확정 업로드가 많으면 새 서명을 발급하지 않는다", async () => {
    mocks.countDocuments.mockResolvedValueOnce(12).mockResolvedValueOnce(12);

    await expect(
      createVisitLogImageUpload(userId, {
        contentType: "image/webp",
        fileSize: 2048,
      }),
    ).rejects.toMatchObject({
      status: 429,
      code: "IMAGE_UPLOAD_LIMIT_EXCEEDED",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("AWS 서명 발급이 실패하면 pending 기록을 제거한다", async () => {
    mocks.createPresignedPost.mockRejectedValue(new Error("AWS unavailable"));

    await expect(
      createVisitLogImageUpload(userId, {
        contentType: "image/webp",
        fileSize: 2048,
      }),
    ).rejects.toThrow("AWS unavailable");
    expect(mocks.deleteOne).toHaveBeenCalledWith({
      _id: new Types.ObjectId(uploadId),
      status: "pending",
    });
  });
});
