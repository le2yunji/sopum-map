export const VISIT_LOG_STATUSES = ["active", "deleted"] as const;

export const VISIT_LOG_CONTENT_MAX_LENGTH = 1_000;
export const VISIT_LOG_TAG_MAX_COUNT = 8;

export type VisitLogStatus = (typeof VISIT_LOG_STATUSES)[number];
