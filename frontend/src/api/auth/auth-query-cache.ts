import type { QueryClient } from "@tanstack/react-query";

import { courseKeys } from "@/api/course/course.query";
import { ME_QUERY_KEYS } from "@/api/me/me.query-keys";
import {
  likedShopQueryKeys,
  pickFolderQueryKeys,
} from "@/api/pick-folder/pick-folder.query";
import { shopQueryKeys } from "@/api/shops/shop.query";
import { visitLogKeys } from "@/api/visit-log/visit-log.query";

const AUTHENTICATED_QUERY_KEYS = [
  ME_QUERY_KEYS.all,
  pickFolderQueryKeys.all,
  likedShopQueryKeys.all,
  shopQueryKeys.all,
  courseKeys.details(),
  courseKeys.myCourses(),
  courseKeys.likedCourses(),
  visitLogKeys.myLists(),
  visitLogKeys.myDetails(),
] as const;

/** 로그아웃한 사용자의 데이터가 다음 세션에 남지 않도록 캐시를 정리합니다. */
export function clearAuthenticatedQueryCache(queryClient: QueryClient) {
  for (const queryKey of AUTHENTICATED_QUERY_KEYS) {
    queryClient.removeQueries({ queryKey });
  }

  queryClient.setQueryData(ME_QUERY_KEYS.profile(), null);
}
