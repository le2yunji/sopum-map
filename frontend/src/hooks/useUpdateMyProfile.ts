"use client";

import type { UpdateMyProfileRequest, UserProfile } from "@sopum-map/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateMyProfile } from "@/api/me/me.api";
import { ME_QUERY_KEYS } from "@/api/me/me.query-keys";

/** 프로필을 수정하고 현재 사용자 캐시를 최신 값으로 교체합니다. */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMyProfileRequest) => updateMyProfile(input),

    onSuccess: (profile) => {
      queryClient.setQueryData<UserProfile>(ME_QUERY_KEYS.profile(), profile);
    },
  });
}
