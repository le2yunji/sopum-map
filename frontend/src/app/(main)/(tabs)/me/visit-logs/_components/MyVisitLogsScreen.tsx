"use client";

import Link from "next/link";

import { useInfiniteMyVisitLogs } from "@/api/visit-log/visit-log.query";
import { AddIcon } from "@/components/icons";
import { BackButton } from "@/components/navigation/BackButton";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMyActivitySummary } from "@/hooks/useMyActivitySummary";

import { MyVisitLogGridItem } from "./MyVisitLogGridItem";

/** 내 방문 로그를 최근 기록부터 사진 피드로 이어서 보여줍니다. */
export function MyVisitLogsScreen() {
  const query = useInfiniteMyVisitLogs();
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => void query.fetchNextPage(),
    hasNextPage: Boolean(query.hasNextPage),
    isLoading: query.isFetchingNextPage,
  });

  if (query.isPending) {
    return <MyVisitLogsLoading />;
  }

  if (query.isError) {
    return (
      <StatePanel
        title="방문 로그를 불러오지 못했어요"
        action="다시 시도"
        onAction={() => void query.refetch()}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-white pb-28 pt-10">
      <header className="flex items-center gap-2 px-5">
        <BackButton ariaLabel="이전 화면으로 돌아가기" className="-ml-2" />

        <div className="min-w-0 flex-1">
          <p className="text-12 font-medium text-green-800">나의 기록</p>
          <h1 className="mt-0.5 truncate text-24 font-semibold">
            내 방문 로그
          </h1>
        </div>

        <Link
          href="/visit-logs/new"
          aria-label="새 방문 로그 작성"
          className="inline-flex size-11 shrink-0 items-center justify-center gap-1 rounded-full bg-green-100 text-13 font-semibold text-green-900 transition-colors hover:bg-green-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 min-[390px]:w-auto min-[390px]:rounded-control min-[390px]:px-3"
        >
          <AddIcon className="size-5 text-green-800" aria-hidden="true" />
          <span className="hidden min-[390px]:inline">새 기록</span>
        </Link>
      </header>

      <div className="px-5">
        <MyVisitLogActivitySummary />
      </div>

      {items.length === 0 ? (
        <MyVisitLogsEmpty />
      ) : (
        <section
          aria-label="내 방문 로그 목록"
          className="mt-4 grid grid-cols-3 gap-0.5 bg-black-100"
        >
          {items.map((item, index) => (
            <MyVisitLogGridItem
              key={item.id}
              visitLog={item}
              imageLoading={index < 6 ? "eager" : "lazy"}
            />
          ))}
        </section>
      )}
      {query.hasNextPage ? (
        <div ref={loadMoreRef} className="h-8" aria-hidden="true" />
      ) : null}
      {query.isFetchingNextPage ? (
        <p role="status" className="py-4 text-center text-13 text-black-500">
          방문 로그를 더 불러오는 중...
        </p>
      ) : null}
    </main>
  );
}

/** 기록이 없을 때 다음 행동을 안내하되 페이지 안에 중복 main 영역을 만들지 않습니다. */
function MyVisitLogsEmpty() {
  return (
    <section className="grid min-h-[55dvh] place-items-center px-6 text-center">
      <div>
        <p className="text-16 text-black-700">아직 방문 로그가 없어요</p>
        <p className="mt-2 text-14 text-black-700">
          다녀온 소품샵을 나만의 기록으로 남겨보세요.
        </p>
        <Link
          href="/visit-logs/new"
          className="mt-5 inline-flex min-h-11 items-center rounded-control bg-green-100 px-5 text-14 font-semibold text-green-900 transition-colors hover:bg-green-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          첫 로그 기록하기
        </Link>
      </div>
    </section>
  );
}

/** 최종 격자와 같은 크기의 뼈대를 보여 화면 흔들림을 줄입니다. */
function MyVisitLogsLoading() {
  return (
    <main
      role="status"
      aria-label="방문 로그를 불러오는 중"
      className="min-h-dvh bg-white pb-28 pt-10"
    >
      <div className="px-5">
        <Skeleton announce={false} className="h-11 w-48 rounded-control" />
        <Skeleton
          announce={false}
          className="mt-4 h-16 rounded-card"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-0.5 bg-black-100">
        {Array.from({ length: 9 }, (_, index) => (
          <Skeleton
            key={index}
            announce={false}
            className="aspect-square rounded-none bg-black-100"
          />
        ))}
      </div>
    </main>
  );
}

/** 전체 활동 집계에서 방문 로그와 방문 상점 수를 표시합니다. */
function MyVisitLogActivitySummary() {
  const activitySummaryQuery = useMyActivitySummary();

  if (activitySummaryQuery.isPending) {
    return (
      <Skeleton
        label="방문 활동 요약을 불러오는 중"
        className="mt-4 h-16 rounded-card"
      />
    );
  }

  if (activitySummaryQuery.isError) {
    return (
      <section
        aria-label="방문 로그 요약"
        className="mt-4 rounded-card bg-green-50 px-3 py-2.5 text-center"
      >
        <p className="text-13 text-black-800">
          방문 활동 요약을 불러오지 못했습니다.
        </p>

        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            void activitySummaryQuery.refetch();
          }}
        >
          요약 다시 시도
        </Button>
      </section>
    );
  }

  const { visitLogCount, visitedShopCount } = activitySummaryQuery.data;

  return (
    <section
      aria-label="방문 로그 요약"
      className="mt-4 grid min-h-16 grid-cols-2 divide-x divide-green-100 rounded-card bg-green-50 px-2 py-2 text-center"
    >
      <div
        aria-label={`쌓인 로그 ${visitLogCount}개`}
        className="flex items-center justify-center gap-1.5 px-2"
      >
        <p className="text-18 font-semibold text-green-700">{visitLogCount}</p>
        <p className="text-12 font-medium text-black-700">쌓인 로그</p>
      </div>

      <Link
        href="/me/visited-shops"
        aria-label={`방문한 상점 ${visitedShopCount}개 보기`}
        className="
            flex items-center justify-center gap-1.5 rounded-control px-2
            transition-colors
            hover:bg-green-100
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-green-700
          "
      >
        <p className="text-18 font-semibold text-green-700">
          {visitedShopCount}
        </p>
        <p className="text-12 font-medium text-black-700">방문한 상점</p>
      </Link>
    </section>
  );
}
