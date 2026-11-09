import type { UserProfile } from "@sopum-map/shared";
import { isApiError } from "@sopum-map/shared";
import { apiClient } from "../client";

export async function getMe(): Promise<UserProfile | null> {
  try {
    return await apiClient<UserProfile>("/me");
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return null;
    }
    throw error;
  }
}
