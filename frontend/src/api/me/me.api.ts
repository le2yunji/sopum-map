import type {
  GetMyVisitedShopsQuery,
  MyActivitySummaryData,
  UpdateMyProfileRequest,
  UserProfile,
  VisitedShopListData,
} from "@sopum-map/shared";
import { isApiError } from "@sopum-map/shared";
import { apiClient } from "../client";

/** 현재 로그인한 사용자의 프로필을 조회합니다. */
export async function getMyProfile(): Promise<UserProfile | null> {
  try {
    return await apiClient<UserProfile>("/me");
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return null;
    }
    throw error;
  }
}

/** 현재 로그인한 사용자의 활동 집계를 조회합니다. */
export function getMyActivitySummary(): Promise<MyActivitySummaryData> {
  return apiClient<MyActivitySummaryData>("/me/activity-summary");
}

/** 현재 로그인한 사용자의 방문 상점 목록을 조회합니다. */
export function getMyVisitedShops(
  query: GetMyVisitedShopsQuery = {},
): Promise<VisitedShopListData> {
  const searchParams = new URLSearchParams();

  if (query.page !== undefined) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    searchParams.set("limit", String(query.limit));
  }

  const queryString = searchParams.toString();
  const path = queryString
    ? `/me/visited-shops?${queryString}`
    : "/me/visited-shops";

  return apiClient<VisitedShopListData>(path);
}

/** 현재 로그인한 사용자의 프로필을 수정합니다. */
export function updateMyProfile(input: UpdateMyProfileRequest) {
  return apiClient<UserProfile>("/me", {
    method: "PATCH",
    body: input,
  });
}
