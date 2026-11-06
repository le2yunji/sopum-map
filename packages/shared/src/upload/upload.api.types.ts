import type { ApiSuccessResponse } from "../api/api.types";
import type { VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE } from "../visit-log/visit-log.types";

/** POST /api/uploads/presign 요청 데이터 */
export type CreateVisitLogImageUploadRequest = Readonly<{
  contentType: typeof VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE;
  fileSize: number;
}>;

export type CreateVisitLogImageUploadData = Readonly<{
  uploadId: string;
  url: string;
  fields: Readonly<Record<string, string>>;
  expiresIn: number;
}>;

/** POST /api/uploads/presign 성공 응답 */
export type CreateVisitLogImageUploadResponse =
  ApiSuccessResponse<CreateVisitLogImageUploadData>;
