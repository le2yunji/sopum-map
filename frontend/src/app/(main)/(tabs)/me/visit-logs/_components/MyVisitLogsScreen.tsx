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
      <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center px-3">
        <BackButton ariaLabel="이전 화면으로 돌아가기" />

        <h1 className="min-w-0 truncate text-center text-20 font-semibold">
          내 방문 기록
        </h1>

        <Link
          href="/visit-logs/new"
          aria-label="새 방문 로그 작성"
          className="inline-flex size-11 items-center justify-center text-black-900 transition-colors hover:text-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <AddIcon className="size-6" aria-hidden="true" />
        </Link>
      </header>

      {items.length > 0 ? (
        <div className="px-5">
          <MyVisitLogActivitySummary />
        </div>
      ) : null}

      {items.length === 0 ? (
        <MyVisitLogsEmpty />
      ) : (
        <section
          aria-label="내 방문 로그 목록"
          className="mt-3 grid grid-cols-3 gap-0.5 bg-black-100"
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
        <Skeleton announce={false} className="mx-auto h-11 w-40 rounded-control" />
        <Skeleton
          announce={false}
          className="mt-5 h-16 rounded-none"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-0.5 bg-black-100">
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
        className="mt-5 h-16 rounded-none"
      />
    );
  }

  if (activitySummaryQuery.isError) {
    return (
      <section aria-label="방문 로그 요약" className="mt-5">
        <p className="text-13 text-black-700">
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
      className="mt-5 grid grid-cols-2 border-y border-black-100 py-3 text-center"
    >
      <div aria-label={`모은 순간 ${visitLogCount}개`}>
        <p className="text-18 font-semibold text-black-900">{visitLogCount}</p>
        <p className="mt-0.5 text-12 text-black-700">모은 순간</p>
      </div>
      <Link
        href="/me/visited-shops"
        aria-label={`방문한 상점 ${visitedShopCount}곳 보기`}
        className="
            flex min-h-11 flex-col items-center justify-center
            border-l border-black-100
            transition-colors
            hover:bg-black-100/60
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-green-700
          "
      >
        <span className="text-18 font-semibold text-black-900">
          {visitedShopCount}
        </span>
        <span className="mt-0.5 text-12 text-black-700">방문한 상점</span>
      </Link>
    </section>
  );
}
