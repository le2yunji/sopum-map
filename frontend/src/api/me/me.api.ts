import type { UpdateMyProfileRequest, UserProfile } from "@sopum-map/shared";
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
/** 현재 로그인한 사용자의 프로필을 수정합니다. */
export function updateMyProfile(input: UpdateMyProfileRequest) {
  return apiClient<UserProfile>("/me", {
    method: "PATCH",
    body: input,
  });
}
