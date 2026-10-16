// frontend/src/api/visit-log/visit-log.api.ts

import type {
  CreateVisitLogData,
  CreateVisitLogRequest,
  GetVisitLogsQuery,
  GetMyVisitLogsQuery,
  MyVisitLogListData,
  MyVisitLogListItem,
  UpdateVisitLogData,
  UpdateVisitLogRequest,
  DeleteVisitLogData,
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

/** 내 방문 로그를 페이지 단위로 조회합니다. */
export async function getMyVisitLogs(
  query: GetMyVisitLogsQuery = {},
): Promise<MyVisitLogListData> {
  const searchParams = createVisitLogsSearchParams(query);
  const queryString = searchParams.toString();
  return apiClient<MyVisitLogListData>(
    `/me/visit-logs${queryString ? `?${queryString}` : ""}`,
  );
}

/** 수정 화면에서 본인 방문 로그 한 건을 조회합니다. */
export async function getMyVisitLog(
  visitLogId: string,
): Promise<MyVisitLogListItem> {
  return apiClient<MyVisitLogListItem>(`/me/visit-logs/${visitLogId}`);
}

/** 본인 방문 로그의 입력 내용을 수정합니다. */
export async function updateVisitLog(
  visitLogId: string,
  input: UpdateVisitLogRequest,
): Promise<UpdateVisitLogData> {
  return apiClient<UpdateVisitLogData>(`/visit-logs/${visitLogId}`, {
    method: "PATCH",
    body: input,
  });
}

/** 본인 방문 로그를 소프트 삭제합니다. */
export async function deleteVisitLog(
  visitLogId: string,
): Promise<DeleteVisitLogData> {
  return apiClient<DeleteVisitLogData>(`/visit-logs/${visitLogId}`, {
    method: "DELETE",
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
