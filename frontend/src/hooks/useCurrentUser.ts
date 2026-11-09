"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "@/api/me/me.api";
import { ME_QUERY_KEYS } from "@/api/me/me.query-keys";

/**
 * 현재 로그인한 사용자 정보를 조회합니다.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ME_QUERY_KEYS.profile(),
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
