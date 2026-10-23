import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import UploadAssetModel from "./upload-asset.model.js";

/** 업로드 상태 모델의 기본 검증 대상을 만듭니다. */
function createUploadAsset(overrides: Record<string, unknown> = {}) {
  return new UploadAssetModel({
    userId: new Types.ObjectId(),
    temporaryKey: "temporary/user/file.webp",
    finalKey: "visit-logs/user/file.webp",
    expectedSize: 1024,
    contentType: "image/webp",
    ...overrides,
  });
}

describe("UploadAsset model", () => {
  it("새 업로드를 pending 상태로 생성한다", async () => {
    const asset = createUploadAsset();

    await asset.validate();

    expect(asset.status).toBe("pending");
    expect(asset.visitLogId).toBeNull();
  });

  it("WebP 이외 형식과 빈 파일을 거부한다", async () => {
    await expect(
      createUploadAsset({ contentType: "image/jpeg" }).validate(),
    ).rejects.toThrow();
    await expect(
      createUploadAsset({ expectedSize: 0 }).validate(),
    ).rejects.toThrow();
  });
});
