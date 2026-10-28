export const VISIT_LOG_STATUSES = ["active", "deleted"] as const;

export const VISIT_LOG_CONTENT_MAX_LENGTH = 1_000;
export const VISIT_LOG_TAG_MAX_COUNT = 8;
export const VISIT_LOG_IMAGE_MAX_COUNT = 3;
export const VISIT_LOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const VISIT_LOG_IMAGE_MAX_EDGE = 1_920;

export const VISIT_LOG_IMAGE_INPUT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE = "image/webp" as const;

export type VisitLogStatus = (typeof VISIT_LOG_STATUSES)[number];
export type VisitLogImageInputType =
  (typeof VISIT_LOG_IMAGE_INPUT_TYPES)[number];
