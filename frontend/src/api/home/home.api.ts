import type { HomeCuratedShops } from "@sopum-map/shared";

import { apiClient } from "../client";

/**
 * 홈 큐레이션 배너에 노출할 상점 목록을 조회합니다.
 */
export const getHomeCuratedShops = async (): Promise<HomeCuratedShops> => {
  return apiClient<HomeCuratedShops>("/home/curated-shops");
};
