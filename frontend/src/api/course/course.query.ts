"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CourseCursorPage,
  CourseDetailData,
  CourseLikeData,
  CreateCourseRequest,
  LikedCourseListData,
  MyCourseListData,
  UpdateCourseRequest,
} from "@sopum-map/shared";

import {
  createCourse,
  deleteCourse,
  getCourseDetail,
  getMyLikedCourses,
  getMyCourses,
  likeCourse,
  unlikeCourse,
  updateCourse,
  updateCourseVisibility,
  setCourseShopVisited,
  unsetCourseShopVisited,
} from "./course.api";

type CourseInfiniteData<TPage> = InfiniteData<TPage, string | undefined>;

type LikeMutationContext = Readonly<{
  previousDetail?: CourseDetailData;
  previousLikedCourses?: CourseInfiniteData<LikedCourseListData>;
}>;

type VisibilityMutationContext = Readonly<{
  previousDetail?: CourseDetailData;
  previousMyCourses?: CourseInfiniteData<MyCourseListData>;
}>;

type CourseShopVisitMutationInput = Readonly<{
  courseId: string;
  shopId: string;
}>;

type CourseShopVisitMutationContext = Readonly<{
  previousDetail?: CourseDetailData;
}>;

export const courseKeys = {
  all: ["courses"] as const,

  details: () => [...courseKeys.all, "detail"] as const,

  detail: (courseId: string) => [...courseKeys.details(), courseId] as const,

  myCourses: () => [...courseKeys.all, "me", "list"] as const,

  likedCourses: () => [...courseKeys.all, "me", "liked", "list"] as const,
};

/** 좋아요 API 결과를 코스 상세 캐시에 반영합니다. */
export function updateCourseDetailLike(
  detail: CourseDetailData | undefined,
  result: CourseLikeData,
): CourseDetailData | undefined {
  if (!detail) {
    return detail;
  }

  return {
    ...detail,
    isLiked: result.isLiked,
    likeCount: result.likeCount,
  };
}

/** 코스 공개 여부를 상세 캐시에 반영합니다. */
export function updateCourseDetailVisibility(
  detail: CourseDetailData | undefined,
  isPublic: boolean,
): CourseDetailData | undefined {
  return detail ? { ...detail, isPublic } : detail;
}

/** 한 상점의 방문 상태만 코스 상세 캐시에 반영합니다. */
export function updateCourseShopVisited(
  detail: CourseDetailData | undefined,
  shopId: string,
  isVisited: boolean,
): CourseDetailData | undefined {
  if (!detail) {
    return detail;
  }

  return {
    ...detail,
    shops: detail.shops.map((shop) =>
      shop.id === shopId ? { ...shop, isVisited } : shop,
    ),
  };
}

/** 방문 상태 변경 전 코스 상세 캐시를 보존하고 원하는 상태를 먼저 표시합니다. */
async function createCourseShopVisitMutationContext(
  queryClient: ReturnType<typeof useQueryClient>,
  input: CourseShopVisitMutationInput,
  isVisited: boolean,
): Promise<CourseShopVisitMutationContext> {
  await queryClient.cancelQueries({ queryKey: courseKeys.detail(input.courseId) });
  const previousDetail = queryClient.getQueryData<CourseDetailData>(
    courseKeys.detail(input.courseId),
  );

  queryClient.setQueryData<CourseDetailData>(
    courseKeys.detail(input.courseId),
    (current) => updateCourseShopVisited(current, input.shopId, isVisited),
  );

  return { previousDetail };
}

/** 방문 상태 변경 실패 시 코스 상세를 이전 값으로 되돌립니다. */
function restoreCourseShopVisitMutationContext(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
  context?: CourseShopVisitMutationContext,
) {
  if (context?.previousDetail) {
    queryClient.setQueryData(courseKeys.detail(courseId), context.previousDetail);
  }
}

/** 코스 상점을 방문 완료 상태로 저장합니다. */
export function useSetCourseShopVisited() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, shopId }: CourseShopVisitMutationInput) =>
      setCourseShopVisited(courseId, shopId),
    onMutate: (input) =>
      createCourseShopVisitMutationContext(queryClient, input, true),
    onError: (_, input, context) =>
      restoreCourseShopVisitMutationContext(queryClient, input.courseId, context),
    onSettled: async (_, __, input) => {
      await queryClient.invalidateQueries({ queryKey: courseKeys.detail(input.courseId) });
    },
  });
}

/** 코스 상점을 미방문 상태로 되돌립니다. */
export function useUnsetCourseShopVisited() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, shopId }: CourseShopVisitMutationInput) =>
      unsetCourseShopVisited(courseId, shopId),
    onMutate: (input) =>
      createCourseShopVisitMutationContext(queryClient, input, false),
    onError: (_, input, context) =>
      restoreCourseShopVisitMutationContext(queryClient, input.courseId, context),
    onSettled: async (_, __, input) => {
      await queryClient.invalidateQueries({ queryKey: courseKeys.detail(input.courseId) });
    },
  });
}

/** 찜한 코스를 모든 무한 목록 페이지에서 제거합니다. */
export function removeLikedCourseFromPages(
  data: CourseInfiniteData<LikedCourseListData> | undefined,
  courseId: string,
): CourseInfiniteData<LikedCourseListData> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.id !== courseId),
    })),
  };
}

/** 내 코스 무한 목록의 공개 여부를 같은 값으로 맞춥니다. */
export function updateMyCourseVisibilityInPages(
  data: CourseInfiniteData<MyCourseListData> | undefined,
  courseId: string,
  isPublic: boolean,
): CourseInfiniteData<MyCourseListData> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.id === courseId ? { ...item, isPublic } : item,
      ),
    })),
  };
}

/** 커서 응답에서 다음 페이지 매개변수를 고릅니다. */
export function getNextCourseCursor<T>(
  page: CourseCursorPage<T>,
): string | undefined {
  return page.hasNext ? (page.nextCursor ?? undefined) : undefined;
}

/**
 * 코스 상세 조회
 */
export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => getCourseDetail(courseId),
    enabled: Boolean(courseId),
  });
}

/**
 * 내 코스 목록 조회
 */
export function useInfiniteMyCourses(enabled = true) {
  return useInfiniteQuery({
    queryKey: courseKeys.myCourses(),
    queryFn: ({ pageParam }) => getMyCourses(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: getNextCourseCursor,
    enabled,
  });
}

/**
 * 내가 좋아요한 코스 무한 목록 조회
 */
export function useInfiniteLikedCourses(enabled = true) {
  return useInfiniteQuery({
    queryKey: courseKeys.likedCourses(),
    queryFn: ({ pageParam }) => getMyLikedCourses(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: getNextCourseCursor,
    enabled,
  });
}

/** 좋아요 변경 전에 관련 캐시를 멈추고 복구용 스냅샷을 만듭니다. */
async function createLikeMutationContext(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
): Promise<LikeMutationContext> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: courseKeys.detail(courseId) }),
    queryClient.cancelQueries({ queryKey: courseKeys.likedCourses() }),
  ]);

  return {
    previousDetail: queryClient.getQueryData(courseKeys.detail(courseId)),
    previousLikedCourses: queryClient.getQueryData(courseKeys.likedCourses()),
  };
}

/** 좋아요 변경 실패 시 상세과 찜 목록을 이전 상태로 복구합니다. */
function restoreLikeMutationContext(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
  context?: LikeMutationContext,
) {
  if (context?.previousDetail) {
    queryClient.setQueryData(
      courseKeys.detail(courseId),
      context.previousDetail,
    );
  }

  if (context?.previousLikedCourses) {
    queryClient.setQueryData(
      courseKeys.likedCourses(),
      context.previousLikedCourses,
    );
  }
}

/**
 * 코스 좋아요 추가
 */
export function useLikeCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeCourse,
    onMutate: async (courseId) => {
      const context = await createLikeMutationContext(queryClient, courseId);

      queryClient.setQueryData<CourseDetailData>(
        courseKeys.detail(courseId),
        (current) =>
          current
            ? {
                ...current,
                isLiked: true,
                likeCount: current.isLiked
                  ? current.likeCount
                  : current.likeCount + 1,
              }
            : current,
      );

      return context;
    },
    onSuccess: (result, courseId) => {
      queryClient.setQueryData<CourseDetailData>(
        courseKeys.detail(courseId),
        (current) => updateCourseDetailLike(current, result),
      );
    },
    onError: (_, courseId, context) => {
      restoreLikeMutationContext(queryClient, courseId, context);
    },
    onSettled: async (_, __, courseId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) }),
        queryClient.invalidateQueries({ queryKey: courseKeys.likedCourses() }),
      ]);
    },
  });
}

/**
 * 코스 좋아요 해제
 */
export function useUnlikeCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlikeCourse,
    onMutate: async (courseId) => {
      const context = await createLikeMutationContext(queryClient, courseId);

      queryClient.setQueryData<CourseDetailData>(
        courseKeys.detail(courseId),
        (current) =>
          current
            ? {
                ...current,
                isLiked: false,
                likeCount: current.isLiked
                  ? Math.max(0, current.likeCount - 1)
                  : current.likeCount,
              }
            : current,
      );
      queryClient.setQueryData<CourseInfiniteData<LikedCourseListData>>(
        courseKeys.likedCourses(),
        (current) => removeLikedCourseFromPages(current, courseId),
      );

      return context;
    },
    onSuccess: (result, courseId) => {
      queryClient.setQueryData<CourseDetailData>(
        courseKeys.detail(courseId),
        (current) => updateCourseDetailLike(current, result),
      );
    },
    onError: (_, courseId, context) => {
      restoreLikeMutationContext(queryClient, courseId, context);
    },
    onSettled: async (_, __, courseId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) }),
        queryClient.invalidateQueries({ queryKey: courseKeys.likedCourses() }),
      ]);
    },
  });
}

/**
 * 내가 만든 코스 공개 여부 변경
 */
export function useUpdateCourseVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, isPublic }: { courseId: string; isPublic: boolean }) =>
      updateCourseVisibility(courseId, { isPublic }),
    onMutate: async ({ courseId, isPublic }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: courseKeys.detail(courseId) }),
        queryClient.cancelQueries({ queryKey: courseKeys.myCourses() }),
      ]);
      const context: VisibilityMutationContext = {
        previousDetail: queryClient.getQueryData(courseKeys.detail(courseId)),
        previousMyCourses: queryClient.getQueryData(courseKeys.myCourses()),
      };

      queryClient.setQueryData<CourseDetailData>(
        courseKeys.detail(courseId),
        (current) => updateCourseDetailVisibility(current, isPublic),
      );
      queryClient.setQueryData<CourseInfiniteData<MyCourseListData>>(
        courseKeys.myCourses(),
        (current) =>
          updateMyCourseVisibilityInPages(current, courseId, isPublic),
      );

      return context;
    },
    onError: (_, { courseId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          courseKeys.detail(courseId),
          context.previousDetail,
        );
      }

      if (context?.previousMyCourses) {
        queryClient.setQueryData(
          courseKeys.myCourses(),
          context.previousMyCourses,
        );
      }
    },
    onSettled: async (_, __, { courseId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) }),
        queryClient.invalidateQueries({ queryKey: courseKeys.myCourses() }),
      ]);
    },
  });
}

/**
 * 코스 생성
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCourseRequest) => createCourse(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: courseKeys.myCourses(),
      });
    },
  });
}

/**
 * 코스 수정
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      input,
    }: {
      courseId: string;
      input: UpdateCourseRequest;
    }) => updateCourse(courseId, input),

    onSuccess: async (_, { courseId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseKeys.detail(courseId),
        }),

        queryClient.invalidateQueries({
          queryKey: courseKeys.myCourses(),
        }),
      ]);
    },
  });
}

/**
 * 코스 삭제
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,

    onSuccess: async (_, courseId) => {
      queryClient.removeQueries({
        queryKey: courseKeys.detail(courseId),
      });

      await queryClient.invalidateQueries({
        queryKey: courseKeys.myCourses(),
      });
    },
  });
}
