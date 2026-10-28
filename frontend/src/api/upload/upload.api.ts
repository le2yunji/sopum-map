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
): Promise<void> {
  const formData = new FormData();
  Object.entries(upload.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  const response = await fetch(upload.url, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error("이미지 업로드에 실패했습니다.");
  }
}
