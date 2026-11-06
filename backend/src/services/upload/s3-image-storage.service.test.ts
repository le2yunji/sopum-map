import { beforeEach, describe, expect, it, vi } from "vitest";

const awsMocks = vi.hoisted(() => ({ createPresignedPost: vi.fn() }));

vi.mock("@aws-sdk/s3-presigned-post", () => ({
  createPresignedPost: awsMocks.createPresignedPost,
}));

vi.mock("../../config/env.js", () => ({
  env: {
    awsRegion: "ap-northeast-2",
    s3BucketName: "sopummap-images",
    imageBaseUrl: "https://images.sopummap.com",
  },
}));

import { createVisitLogImagePresignedPost } from "./s3-image-storage.service.js";

beforeEach(() => {
  vi.clearAllMocks();
  awsMocks.createPresignedPost.mockResolvedValue({
    url: "https://sopummap-images.s3.amazonaws.com/",
    fields: { key: "temporary/user/file.webp", policy: "signed-policy" },
  });
});

describe("createVisitLogImagePresignedPost", () => {
  it("키·WebP 형식·크기·5분 만료를 POST Policy에 고정한다", async () => {
    const result = await createVisitLogImagePresignedPost({
      key: "temporary/user/file.webp",
      uploadId: "upload-id",
    });

    expect(result.fields.policy).toBe("signed-policy");
    expect(awsMocks.createPresignedPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        Bucket: "sopummap-images",
        Key: "temporary/user/file.webp",
        Expires: 300,
        Fields: {
          "Content-Type": "image/webp",
          "x-amz-meta-upload-id": "upload-id",
        },
        Conditions: expect.arrayContaining([
          ["content-length-range", 1, 6 * 1024 * 1024],
          { "Content-Type": "image/webp" },
          { "x-amz-meta-upload-id": "upload-id" },
        ]),
      }),
    );
  });
});
