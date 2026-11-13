"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/api/auth/auth.api";
import { clearAuthenticatedQueryCache } from "@/api/auth/auth-query-cache";

/** 현재 로그인 세션을 종료하고 사용자별 캐시를 정리합니다. */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      clearAuthenticatedQueryCache(queryClient);
    },
  });
}
