"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/api/auth/auth.api";
import { ME_QUERY_KEYS } from "@/api/me/me.query-keys";

/**
 * 현재 로그인 세션을 종료합니다.
 *
 * 서버 로그아웃 성공 후
 * 현재 사용자 Query Cache도 비로그인 상태로 변경합니다.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEYS.profile(), null);
    },
  });
}
