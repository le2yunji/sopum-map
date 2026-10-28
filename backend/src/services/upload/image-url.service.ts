import { createApiError } from "@sopum-map/shared";

import { env } from "../../config/env.js";

/** Private S3 Object Key를 CloudFront 공개 조회 URL로 변환합니다. */
export function createVisitLogImageUrl(key: string): string {
  const baseUrl = env.imageBaseUrl.replace(/\/$/, "");
  if (!baseUrl) {
    throw createApiError({
      status: 503,
      code: "IMAGE_DELIVERY_NOT_CONFIGURED",
      message: "이미지 조회 주소가 아직 설정되지 않았습니다.",
    });
  }

  return `${baseUrl}/${key}`;
}
