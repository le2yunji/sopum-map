import { afterEach, describe, expect, it, vi } from "vitest";

import { uploadVisitLogImageToS3 } from "./upload.api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("uploadVisitLogImageToS3", () => {
  it("서명 필드를 유지하고 file을 마지막 필드로 전송한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["webp"], "image.webp", { type: "image/webp" });

    await uploadVisitLogImageToS3(
      {
        uploadId: "upload-id",
        url: "https://s3.example.com",
        fields: { key: "temporary/user/image.webp", policy: "signed" },
        expiresIn: 300,
      },
      file,
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const entries = Array.from((options.body as FormData).entries());
    expect(entries.map(([key]) => key)).toEqual(["key", "policy", "file"]);
    expect(options.headers).toBeUndefined();
  });

  it("S3 오류 응답을 사용자 오류로 바꾼다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(
      uploadVisitLogImageToS3(
        {
          uploadId: "upload-id",
          url: "https://s3.example.com",
          fields: {},
          expiresIn: 300,
        },
        new File(["webp"], "image.webp", { type: "image/webp" }),
      ),
    ).rejects.toThrow("이미지 업로드에 실패했습니다.");
  });
});
