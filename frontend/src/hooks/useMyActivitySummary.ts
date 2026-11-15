"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyActivitySummary } from "@/api/me/me.api";
import { meQueryKeys } from "@/api/me/me.query-keys";

/** 로그인 사용자의 활동 집계를 화면에서 재사용할 수 있게 조회합니다. */
export function useMyActivitySummary(enabled = true) {
  return useQuery({
    queryKey: meQueryKeys.activitySummary(),
    queryFn: getMyActivitySummary,
    enabled,
  });
}
