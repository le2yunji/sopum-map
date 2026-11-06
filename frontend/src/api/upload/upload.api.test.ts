import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { uploadVisitLogImageToS3 } from "./upload.api";

class FakeXMLHttpRequest {
  static latest: FakeXMLHttpRequest | undefined;

  readonly upload = new EventTarget();
  readonly loadEvents = new EventTarget();
  method = "";
  url = "";
  body: Document | XMLHttpRequestBodyInit | null = null;
  status = 204;

  constructor() {
    FakeXMLHttpRequest.latest = this;
  }

  /** 요청 방식과 주소를 기록합니다. */
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  /** 업로드 본문을 기록하고 성공 응답을 전달합니다. */
  send(body: Document | XMLHttpRequestBodyInit | null) {
    this.body = body;
    queueMicrotask(() => this.loadEvents.dispatchEvent(new Event("load")));
  }

  /** 실제 XHR의 이벤트 등록 형태를 흉내 냅니다. */
  addEventListener(type: string, listener: EventListener) {
    this.loadEvents.addEventListener(type, listener);
  }

  /** 취소 처리를 검증할 수 있도록 abort 이벤트를 전달합니다. */
  abort() {
    this.loadEvents.dispatchEvent(new Event("abort"));
  }
}

beforeEach(() => {
  FakeXMLHttpRequest.latest = undefined;
  vi.stubGlobal("XMLHttpRequest", FakeXMLHttpRequest);
});

afterEach(() => vi.unstubAllGlobals());

describe("uploadVisitLogImageToS3", () => {
  it("서명 필드를 유지하고 file을 마지막 필드로 전송한다", async () => {
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

    const request = FakeXMLHttpRequest.latest;
    expect(request?.method).toBe("POST");
    expect(request?.url).toBe("https://s3.example.com");
    const entries = Array.from((request?.body as FormData).entries());
    expect(entries.map(([key]) => key)).toEqual(["key", "policy", "file"]);
  });

  it("S3 오류 응답을 사용자 오류로 바꾼다", async () => {
    const uploadPromise = uploadVisitLogImageToS3(
      {
        uploadId: "upload-id",
        url: "https://s3.example.com",
        fields: {},
        expiresIn: 300,
      },
      new File(["webp"], "image.webp", { type: "image/webp" }),
    );
    const request = FakeXMLHttpRequest.latest;
    if (request) request.status = 500;

    await expect(uploadPromise).rejects.toThrow("이미지 업로드에 실패했습니다.");
  });

  it("업로드한 바이트 비율을 정수 퍼센트로 전달한다", async () => {
    const onProgress = vi.fn();
    const uploadPromise = uploadVisitLogImageToS3(
      {
        uploadId: "upload-id",
        url: "https://s3.example.com",
        fields: {},
        expiresIn: 300,
      },
      new File(["webp"], "image.webp", { type: "image/webp" }),
      undefined,
      onProgress,
    );

    const progressEvent = new Event("progress");
    Object.defineProperties(progressEvent, {
      lengthComputable: { value: true },
      loaded: { value: 5 },
      total: { value: 10 },
    });
    FakeXMLHttpRequest.latest?.upload.dispatchEvent(progressEvent);
    await uploadPromise;

    expect(onProgress).toHaveBeenNthCalledWith(1, 50);
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });
});
