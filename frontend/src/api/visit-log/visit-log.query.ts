import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateVisitLogRequest, MyVisitLogListData, UpdateVisitLogRequest } from "@sopum-map/shared";

import { shopQueryKeys } from "../shops/shop.query";
import {
  createVisitLog,
  deleteVisitLog,
  getMyVisitLog,
  getMyVisitLogs,
  updateVisitLog,
} from "./visit-log.api";

const MY_VISIT_LOG_PAGE_SIZE = 10;

export const visitLogKeys = {
  all: ["visit-logs"] as const,
  myLists: () => [...visitLogKeys.all, "me", "list"] as const,
  myDetails: () => [...visitLogKeys.all, "me", "detail"] as const,
  myDetail: (visitLogId: string) => [...visitLogKeys.myDetails(), visitLogId] as const,
};

/** 비어 있거나 잘못된 응답에서는 추가 페이지 요청을 만들지 않습니다. */
export function getNextVisitLogPage(
  lastPage: MyVisitLogListData | undefined,
): number | undefined {
  return lastPage?.pagination.hasNext
    ? lastPage.pagination.page + 1
    : undefined;
}

/** 삭제로 비어진 마지막 페이지를 제거해 사용자가 빈 화면에 남지 않게 합니다. */
export function removeVisitLogFromPages(
  data: InfiniteData<MyVisitLogListData, number> | undefined,
  visitLogId: string,
): InfiniteData<MyVisitLogListData, number> | undefined {
  if (!data) return data;

  const totalCount = Math.max(
    0,
    (data.pages[0]?.pagination.totalCount ?? 0) - 1,
  );
  const limit = data.pages[0]?.pagination.limit ?? MY_VISIT_LOG_PAGE_SIZE;
  const totalPages = Math.ceil(totalCount / limit);
  const pages = data.pages
    .map((page) => ({
      ...page,
      items: page.items.filter((item) => item.id !== visitLogId),
      pagination: {
        ...page.pagination,
        totalCount,
        totalPages,
        hasNext: page.pagination.page < totalPages,
      },
      summary: { ...page.summary, totalCount },
    }))
    .filter((page, index) => index === 0 || page.items.length > 0);

  return {
    pages,
    pageParams: data.pageParams.slice(0, pages.length),
  };
}

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

/** 내 방문 로그를 최신 방문일순으로 이어서 조회합니다. */
export function useInfiniteMyVisitLogs() {
  return useInfiniteQuery({
    queryKey: visitLogKeys.myLists(),
    queryFn: ({ pageParam }) =>
      getMyVisitLogs({ page: pageParam, limit: MY_VISIT_LOG_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: getNextVisitLogPage,
  });
}

/** 수정 화면에 본인 방문 로그 한 건을 제공합니다. */
export function useMyVisitLog(visitLogId: string) {
  return useQuery({
    queryKey: visitLogKeys.myDetail(visitLogId),
    queryFn: () => getMyVisitLog(visitLogId),
    enabled: Boolean(visitLogId),
  });
}

/** 방문 로그 수정 뒤 목록과 단건 캐시를 새 데이터로 바꿉니다. */
export function useUpdateVisitLog(visitLogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateVisitLogRequest) => updateVisitLog(visitLogId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: visitLogKeys.myLists() }),
        queryClient.invalidateQueries({ queryKey: visitLogKeys.myDetail(visitLogId) }),
        queryClient.invalidateQueries({ queryKey: shopQueryKeys.all }),
      ]);
    },
  });
}

/** 방문 로그 삭제 뒤 내 목록과 상점 공개 정보를 다시 조회합니다. */
export function useDeleteVisitLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVisitLog,
    onSuccess: async (_, visitLogId) => {
      queryClient.setQueryData<InfiniteData<MyVisitLogListData, number>>(
        visitLogKeys.myLists(),
        (current) => removeVisitLogFromPages(current, visitLogId),
      );
      await queryClient.invalidateQueries({ queryKey: visitLogKeys.myLists() });
      await queryClient.invalidateQueries({ queryKey: shopQueryKeys.all });
    },
  });
}
