// frontend/src/api/visit-log/visit-log.api.ts

import type {
  CreateVisitLogData,
  CreateVisitLogRequest,
  GetVisitLogsQuery,
  VisitLogListData,
} from "@sopum-map/shared";

import { apiClient } from "../client";

/** 이미지 없이 새 방문 로그를 작성합니다. */
export async function createVisitLog(
  shopId: string,
  input: CreateVisitLogRequest,
): Promise<CreateVisitLogData> {
  return apiClient<CreateVisitLogData>(`/shops/${shopId}/visit-logs`, {
    method: "POST",
    body: input,
  });
}

/** 방문 기록 조회 조건을 URL query string으로 변환합니다. */
export function createVisitLogsSearchParams(
  query: GetVisitLogsQuery,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (query.page !== undefined) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    searchParams.set("limit", String(query.limit));
  }

  return searchParams;
}

/** 매장별 방문 기록을 조회합니다. */
export async function getVisitLogs(
  shopId: string,
  query: GetVisitLogsQuery = {},
): Promise<VisitLogListData> {
  const searchParams = createVisitLogsSearchParams(query);

  const queryString = searchParams.toString();

  return apiClient<VisitLogListData>(
    `/shops/${shopId}/visit-logs${queryString ? `?${queryString}` : ""}`,
  );
}
