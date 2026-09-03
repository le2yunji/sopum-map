"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/api/auth/auth.api";
import { AUTH_QUERY_KEYS } from "@/api/auth/auth.query-keys";

/**
 * 현재 로그인한 사용자 정보를 조회합니다.a
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me(),

    queryFn: getMe,

    /**
     * 5분 동안은 기존 데이터를 fresh 상태로 봅니다.
     */
    staleTime: 5 * 60 * 1000,

    /**
     * 로그인하지 않은 경우는 getMe()에서 null을 반환하므로
     * 재시도할 필요가 없습니다.
     *
     * 서버 장애 등의 오류도 인증 조회에서는
     * 반복 요청하지 않도록 우선 false로 둡니다.
     */
    retry: false,
  });
}
