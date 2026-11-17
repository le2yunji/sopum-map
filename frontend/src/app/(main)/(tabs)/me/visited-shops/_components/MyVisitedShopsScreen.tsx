"use client";

import type { ReactNode } from "react";

import { BackButton } from "@/components/navigation/BackButton";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useInfiniteMyVisitedShops } from "@/hooks/useInfiniteMyVisitedShops";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import { MyVisitedShopCard } from "./MyVisitedShopCard";

/** 내 방문 상점의 상태와 무한 목록을 한 화면에서 관리합니다. */
export function MyVisitedShopsScreen() {
  const query = useInfiniteMyVisitedShops();
  const shops = query.data?.pages.flatMap((page) => page.items) ?? [];

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => {
      void query.fetchNextPage();
    },
    hasNextPage: Boolean(query.hasNextPage),
    isLoading: query.isFetchingNextPage,
  });

  let content: ReactNode;

  if (query.isPending) {
    content = (
      <div role="status" className="pt-12 text-center text-14 text-black-500">
        방문한 상점을 불러오는 중...
      </div>
    );
  } else if (query.isError) {
    content = (
      <div className="pt-12">
        <StatePanel
          title="방문한 상점을 불러오지 못했어요"
          action="다시 시도"
          onAction={() => {
            void query.refetch();
          }}
        />
      </div>
    );
  } else if (shops.length === 0) {
    content = (
      <div className="pt-12">
        <StatePanel
          title="아직 방문한 상점이 없어요"
          description="방문 로그를 남기거나 코스 상점을 방문 완료해 보세요."
          action="상점 둘러보기"
          actionHref="/map"
        />
      </div>
    );
  } else {
    content = (
      <ul
        aria-label="내가 방문한 상점 목록"
        className="mt-5 divide-y divide-stroke-subtle"
      >
        {shops.map((shop, index) => (
          <li key={shop.id}>
            <MyVisitedShopCard
              shop={shop}
              imageLoading={index === 0 ? "eager" : "lazy"}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-5rem)] px-5 pb-6">
      <header
        className="
          sticky top-0 z-20 -mx-5
          bg-surface-primary/95
          px-5 pb-4 pt-10
          backdrop-blur-sm
        "
      >
        <div className="flex items-center gap-2">
          <BackButton ariaLabel="이전 화면으로 돌아가기" className="-ml-2" />

          <div className="min-w-0">
            <p className="text-12 text-green-700">나의 기록</p>
            <h1 className="mt-1 text-24 font-semibold">방문한 상점</h1>
          </div>
        </div>
      </header>

      {content}

      {query.isSuccess && query.hasNextPage ? (
        <div ref={loadMoreRef} className="h-8" aria-hidden="true" />
      ) : null}

      {query.isSuccess && query.isFetchingNextPage ? (
        <p role="status" className="py-4 text-center text-13 text-black-500">
          방문한 상점을 더 불러오는 중...
        </p>
      ) : null}
    </main>
  );
}
