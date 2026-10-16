// backend/src/services/visit-log/visit-log.service.types.ts

import type {
  CreateVisitLogData,
  CreateVisitLogRequest,
  DeleteVisitLogData,
  MyVisitLogListData,
  MyVisitLogListItem,
  UpdateVisitLogData,
  UpdateVisitLogRequest,
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

export type GetMyVisitLogsServiceParams = Readonly<{
  userId: string;
  page: number;
  limit: number;
}>;

export type GetMyVisitLogsServiceResult = MyVisitLogListData;
export type GetMyVisitLogServiceResult = MyVisitLogListItem;
export type UpdateVisitLogServiceInput = UpdateVisitLogRequest;
export type UpdateVisitLogServiceResult = UpdateVisitLogData;
export type DeleteVisitLogServiceResult = DeleteVisitLogData;
