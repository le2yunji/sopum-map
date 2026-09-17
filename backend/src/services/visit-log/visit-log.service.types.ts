// backend/src/services/visit-log/visit-log.service.types.ts

import type { VisitLogListData } from "@sopum-map/shared";

export type GetVisitLogsServiceParams = Readonly<{
  shopId: string;
  userId?: string;
  page: number;
  limit: number;
}>;

export type GetVisitLogsServiceResult = VisitLogListData;
