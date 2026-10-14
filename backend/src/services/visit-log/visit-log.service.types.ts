// backend/src/services/visit-log/visit-log.service.types.ts

import type {
  CreateVisitLogData,
  CreateVisitLogRequest,
  VisitLogListData,
} from "@sopum-map/shared";

export type CreateVisitLogServiceInput = CreateVisitLogRequest;

export type CreateVisitLogServiceResult = CreateVisitLogData;

export type GetVisitLogsServiceParams = Readonly<{
  shopId: string;
  userId?: string;
  page: number;
  limit: number;
}>;

export type GetVisitLogsServiceResult = VisitLogListData;
