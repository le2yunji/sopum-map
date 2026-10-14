import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateVisitLogRequest } from "@sopum-map/shared";

import { shopQueryKeys } from "../shops/shop.query";
import { createVisitLog } from "./visit-log.api";

/** 지정한 상점에 방문 로그를 작성하고 상세 정보를 새로고침합니다. */
export function useCreateVisitLog(shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVisitLogRequest) => createVisitLog(shopId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: shopQueryKeys.detail(shopId),
      });
    },
  });
}
