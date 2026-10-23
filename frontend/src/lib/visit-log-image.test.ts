import { describe, expect, it } from "vitest";

import { detectVisitLogImageType } from "./visit-log-image";

describe("detectVisitLogImageType", () => {
  it.each([
    [new Uint8Array([0xff, 0xd8, 0xff, 0x00]), "image/jpeg"],
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47]), "image/png"],
    [new TextEncoder().encode("RIFF0000WEBP"), "image/webp"],
    [new Uint8Array([...new TextEncoder().encode("0000ftypheic")]), "image/heic"],
  ])("파일 시그니처로 실제 형식을 판별한다", async (bytes, expected) => {
    await expect(detectVisitLogImageType(new Blob([bytes]))).resolves.toBe(expected);
  });

  it("이미지가 아닌 파일을 거부한다", async () => {
    await expect(
      detectVisitLogImageType(new Blob(["plain text"])),
    ).resolves.toBeNull();
  });
});
