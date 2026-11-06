import { describe, expect, it } from "vitest";

import { createVisitLogImageUploadSchema } from "./upload.validation.js";

describe("createVisitLogImageUploadSchema", () => {
  it("5MiB 이하 WebP 업로드 요청을 허용한다", () => {
    const request = {
      body: { contentType: "image/webp", fileSize: 5 * 1024 * 1024 },
    };

    expect(createVisitLogImageUploadSchema.parse(request)).toEqual(request);
  });

  it.each([
    { contentType: "image/jpeg", fileSize: 100 },
    { contentType: "image/webp", fileSize: 0 },
    { contentType: "image/webp", fileSize: 5 * 1024 * 1024 + 1 },
  ])("WebP가 아니거나 크기 제한을 벗어나면 거부한다", (body) => {
    expect(() => createVisitLogImageUploadSchema.parse({ body })).toThrow();
  });
});
