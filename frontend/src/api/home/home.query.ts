import { useQuery } from "@tanstack/react-query";

import { getHomeCuratedShops } from "./home.api";

export const homeQueryKeys = {
  all: ["home"] as const,
  curatedShops: () => [...homeQueryKeys.all, "curated-shops"] as const,
};

/**
 * 홈 큐레이션 배너 상점 목록을 조회합니다.
 */
export const useHomeCuratedShops = () => {
  return useQuery({
    queryKey: homeQueryKeys.curatedShops(),
    queryFn: getHomeCuratedShops,
  });
};
