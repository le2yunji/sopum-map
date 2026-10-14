export const VISIT_LOG_STATUSES = ["active", "deleted"] as const;

export type VisitLogStatus = (typeof VISIT_LOG_STATUSES)[number];
