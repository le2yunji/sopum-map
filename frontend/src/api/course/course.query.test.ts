import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  cancelQueries: vi.fn(),
  getQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
  removeQueries: vi.fn(),
  setQueryData: vi.fn(),
  useInfiniteQuery: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: queryMocks.useInfiniteQuery,
  useMutation: queryMocks.useMutation,
  useQuery: queryMocks.useQuery,
  useQueryClient: queryMocks.useQueryClient,
}));

import type {
  CourseDetailData,
  CourseLikeData,
  LikedCourseListData,
  MyCourseListData,
} from "@sopum-map/shared";
import type { InfiniteData } from "@tanstack/react-query";

import { meQueryKeys } from "@/api/me/me.query-keys";

import {
  courseKeys,
  getNextCourseCursor,
  removeLikedCourseFromPages,
  updateCourseDetailLike,
  updateCourseDetailVisibility,
  updateCourseShopVisited,
  updateMyCourseVisibilityInPages,
  useCreateCourse,
  useDeleteCourse,
  useSetCourseShopVisited,
  useUnsetCourseShopVisited,
} from "./course.query";

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useMutation.mockImplementation((options) => options);
  queryMocks.useQueryClient.mockReturnValue({
    cancelQueries: queryMocks.cancelQueries,
    getQueryData: queryMocks.getQueryData,
    invalidateQueries: queryMocks.invalidateQueries,
    removeQueries: queryMocks.removeQueries,
    setQueryData: queryMocks.setQueryData,
  });
});

const detail: CourseDetailData = {
  id: "course-1",
  courseType: "user_created",
  sourceFolderId: "folder-1",
  title: "성수 소품 산책",
  description: null,
  regionGroup: "seongsu-seoulforest",
  isPublic: true,
  isOfficialPick: false,
  author: {
    id: "user-1",
    displayName: "만든 사람",
    profileImageUrl: null,
    isService: false,
  },
  isOwner: false,
  likeCount: 2,
  isLiked: false,
  shops: [],
  createdAt: "2026-10-12T00:00:00.000Z",
  updatedAt: "2026-10-12T00:00:00.000Z",
};

const likeResult: CourseLikeData = {
  courseId: "course-1",
  isLiked: true,
  likeCount: 3,
};

/** 한 페이지뿐인 무한 목록 테스트 데이터를 만듭니다. */
function createInfiniteData<T>(page: T): InfiniteData<T, string | undefined> {
  return {
    pages: [page],
    pageParams: [undefined],
  };
}

describe("course query cache helpers", () => {
  it("지역이나 정렬이 달라지면 공개 코스 목록 키도 달라진다", () => {
    const latestAll = courseKeys.publicList({ sort: "latest" });
    const popularAll = courseKeys.publicList({ sort: "popular" });
    const latestMangwon = courseKeys.publicList({
      regionGroup: "mangwon",
      sort: "latest",
    });

    expect(popularAll).not.toEqual(latestAll);
    expect(latestMangwon).not.toEqual(latestAll);
  });

  it("한국 날짜가 달라지면 홈 추천 키도 달라진다", () => {
    expect(courseKeys.home("2026-11-11")).not.toEqual(
      courseKeys.home("2026-11-12"),
    );
  });

  it("좋아요 결과를 상세 캐시에 즉시 반영한다", () => {
    expect(updateCourseDetailLike(detail, likeResult)).toMatchObject({
      isLiked: true,
      likeCount: 3,
    });
  });

  it("공개·비공개 찜 항목을 모두 목록에서 제거한다", () => {
    const data = createInfiniteData<LikedCourseListData>({
      items: [
        {
          id: "course-1",
          isPrivate: false,
          title: "성수 소품 산책",
          description: null,
          regionGroup: "seongsu-seoulforest",
          shopCount: 2,
          mainImageUrl: null,
          author: detail.author,
          likeCount: 3,
          likedAt: "2026-10-12T01:00:00.000Z",
        },
        {
          id: "course-2",
          isPrivate: true,
          likedAt: "2026-10-12T00:00:00.000Z",
        },
      ],
      hasNext: false,
      nextCursor: null,
    });

    expect(
      removeLikedCourseFromPages(data, "course-1")?.pages[0].items,
    ).toEqual([expect.objectContaining({ id: "course-2", isPrivate: true })]);
    expect(
      removeLikedCourseFromPages(data, "course-2")?.pages[0].items,
    ).toEqual([expect.objectContaining({ id: "course-1", isPrivate: false })]);
  });

  it("공개 상태를 상세과 내 코스 목록에 함께 반영한다", () => {
    const data = createInfiniteData<MyCourseListData>({
      items: [
        {
          id: "course-1",
          title: "성수 소품 산책",
          description: null,
          regionGroup: "seongsu-seoulforest",
          sourceFolderId: "folder-1",
          shopCount: 2,
          mainImageUrl: null,
          isPublic: true,
          likeCount: 2,
          createdAt: "2026-10-12T00:00:00.000Z",
          updatedAt: "2026-10-12T00:00:00.000Z",
        },
      ],
      hasNext: false,
      nextCursor: null,
    });

    expect(updateCourseDetailVisibility(detail, false)?.isPublic).toBe(false);
    expect(
      updateMyCourseVisibilityInPages(data, "course-1", false)?.pages[0]
        .items[0].isPublic,
    ).toBe(false);
  });

  it("다음 페이지 매개변수로 nextCursor를 사용한다", () => {
    expect(
      getNextCourseCursor({ items: [], hasNext: true, nextCursor: "cursor-2" }),
    ).toBe("cursor-2");
    expect(
      getNextCourseCursor({ items: [], hasNext: false, nextCursor: null }),
    ).toBeUndefined();
  });

  it("낙관적 변경 전 값을 보존하면 실패 시 그대로 복구할 수 있다", () => {
    const previousDetail = detail;
    const optimisticDetail = updateCourseDetailLike(detail, likeResult);

    expect(optimisticDetail).not.toBe(previousDetail);
    expect(previousDetail).toMatchObject({ isLiked: false, likeCount: 2 });
  });

  it("한 상점의 방문 상태만 상세 캐시에 반영한다", () => {
    const courseWithShops: CourseDetailData = {
      ...detail,
      shops: [
        {
          id: "shop-1",
          name: "첫 상점",
          address: "서울",
          mainImageUrl: null,
          regionGroup: "seongsu-seoulforest",
          latitude: 37,
          longitude: 127,
          status: "active",
          isUnavailable: false,
          isVisited: false,
          order: 1,
          memo: null,
          walkingDistanceFromPreviousMeters: null,
          walkingDurationFromPreviousSeconds: null,
        },
        {
          id: "shop-2",
          name: "둘째 상점",
          address: "서울",
          mainImageUrl: null,
          regionGroup: "seongsu-seoulforest",
          latitude: 37,
          longitude: 127,
          status: "active",
          isUnavailable: false,
          isVisited: false,
          order: 2,
          memo: null,
          walkingDistanceFromPreviousMeters: null,
          walkingDurationFromPreviousSeconds: null,
        },
      ],
    };

    const result = updateCourseShopVisited(courseWithShops, "shop-2", true);

    expect(result?.shops.map((shop) => shop.isVisited)).toEqual([false, true]);
  });
});

describe("코스 활동 요약 캐시", () => {
  it("코스 생성 성공 뒤 내 코스와 활동 요약을 갱신한다", async () => {
    const mutation = useCreateCourse() as unknown as {
      onSuccess: () => Promise<void>;
    };

    await mutation.onSuccess();

    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: courseKeys.myCourses(),
    });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: meQueryKeys.activitySummary(),
    });
  });

  it("코스 삭제 성공 뒤 내 코스와 활동 요약을 갱신한다", async () => {
    const mutation = useDeleteCourse() as unknown as {
      onSuccess: (data: unknown, courseId: string) => Promise<void>;
    };

    await mutation.onSuccess(undefined, "course-1");

    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: courseKeys.myCourses(),
    });
    expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: meQueryKeys.activitySummary(),
    });
  });

  it.each([
    ["방문 설정", useSetCourseShopVisited],
    ["방문 해제", useUnsetCourseShopVisited],
  ])(
    "코스 상점 %s 성공 뒤 활동 요약을 갱신한다",
    async (_, useMutationHook) => {
      const mutation = useMutationHook() as unknown as {
        onSuccess: () => Promise<void>;
      };

      await mutation.onSuccess();

      expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
        queryKey: meQueryKeys.activitySummary(),
      });
      expect(queryMocks.invalidateQueries).toHaveBeenCalledWith({
        queryKey: meQueryKeys.visitedShops(),
      });
    },
  );
});
