import type {
  CreateVisitLogImageUploadData,
  CreateVisitLogImageUploadRequest,
} from "@sopum-map/shared";

import { apiClient } from "../client";

/** 방문 로그 이미지의 Private S3 직접 업로드 정보를 발급받습니다. */
export async function createVisitLogImageUpload(
  input: CreateVisitLogImageUploadRequest,
): Promise<CreateVisitLogImageUploadData> {
  return apiClient<CreateVisitLogImageUploadData>("/uploads/presign", {
    method: "POST",
    body: input,
  });
}

/** AWS가 제공한 모든 필드를 유지하고 파일 필드를 마지막에 붙여 업로드합니다. */
export async function uploadVisitLogImageToS3(
  upload: CreateVisitLogImageUploadData,
  file: File,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const formData = new FormData();
  Object.entries(upload.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    /** 요청이 끝나면 외부 취소 신호 연결을 정리합니다. */
    const cleanup = () => signal?.removeEventListener("abort", abortUpload);

    /** 브라우저 취소 신호를 진행 중인 S3 요청에 전달합니다. */
    const abortUpload = () => request.abort();

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      cleanup();
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(new Error("이미지 업로드에 실패했습니다."));
    });
    request.addEventListener("error", () => {
      cleanup();
      reject(new Error("이미지 업로드에 실패했습니다."));
    });
    request.addEventListener("abort", () => {
      cleanup();
      reject(new DOMException("이미지 업로드가 취소되었습니다.", "AbortError"));
    });

    if (signal?.aborted) {
      reject(new DOMException("이미지 업로드가 취소되었습니다.", "AbortError"));
      return;
    }

    signal?.addEventListener("abort", abortUpload, { once: true });
    request.open("POST", upload.url);
    request.send(formData);
  });
}
