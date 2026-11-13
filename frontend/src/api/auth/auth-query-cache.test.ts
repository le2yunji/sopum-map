import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { courseKeys } from "@/api/course/course.query";
import { ME_QUERY_KEYS } from "@/api/me/me.query-keys";
import {
  likedShopQueryKeys,
  pickFolderQueryKeys,
} from "@/api/pick-folder/pick-folder.query";
import { shopQueryKeys } from "@/api/shops/shop.query";
import { visitLogKeys } from "@/api/visit-log/visit-log.query";

import { clearAuthenticatedQueryCache } from "./auth-query-cache";

describe("clearAuthenticatedQueryCache", () => {
  it("사용자별 캐시는 지우고 공개 코스 캐시는 유지한다", () => {
    const queryClient = new QueryClient();
    const publicCourseKey = courseKeys.publicList({ sort: "latest" });
    const homeCourseKey = courseKeys.home("2026-11-13");

    queryClient.setQueryData(ME_QUERY_KEYS.profile(), { id: "user-1" });
    queryClient.setQueryData(pickFolderQueryKeys.list(), ["folder-1"]);
    queryClient.setQueryData(likedShopQueryKeys.list(), ["shop-1"]);
    queryClient.setQueryData(shopQueryKeys.detail("shop-1"), {
      isLiked: true,
    });
    queryClient.setQueryData(courseKeys.detail("course-1"), {
      isLiked: true,
      isOwner: true,
    });
    queryClient.setQueryData(courseKeys.myCourses(), ["course-1"]);
    queryClient.setQueryData(courseKeys.likedCourses(), ["course-1"]);
    queryClient.setQueryData(visitLogKeys.myLists(), ["visit-log-1"]);
    queryClient.setQueryData(
      visitLogKeys.myDetail("visit-log-1"),
      "visit-log-1",
    );
    queryClient.setQueryData(publicCourseKey, ["public-course-1"]);
    queryClient.setQueryData(homeCourseKey, ["home-course-1"]);

    clearAuthenticatedQueryCache(queryClient);

    expect(queryClient.getQueryData(ME_QUERY_KEYS.profile())).toBeNull();
    expect(queryClient.getQueryData(pickFolderQueryKeys.list())).toBeUndefined();
    expect(queryClient.getQueryData(likedShopQueryKeys.list())).toBeUndefined();
    expect(
      queryClient.getQueryData(shopQueryKeys.detail("shop-1")),
    ).toBeUndefined();
    expect(
      queryClient.getQueryData(courseKeys.detail("course-1")),
    ).toBeUndefined();
    expect(queryClient.getQueryData(courseKeys.myCourses())).toBeUndefined();
    expect(queryClient.getQueryData(courseKeys.likedCourses())).toBeUndefined();
    expect(queryClient.getQueryData(visitLogKeys.myLists())).toBeUndefined();
    expect(
      queryClient.getQueryData(visitLogKeys.myDetail("visit-log-1")),
    ).toBeUndefined();
    expect(queryClient.getQueryData(publicCourseKey)).toEqual([
      "public-course-1",
    ]);
    expect(queryClient.getQueryData(homeCourseKey)).toEqual([
      "home-course-1",
    ]);
  });
});
