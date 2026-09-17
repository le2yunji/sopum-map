"use client";

import type { VisitLogListItem } from "@sopum-map/shared";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { getVisitLogs } from "@/api/visit-log/visit-log.api";
import { CameraIcon } from "@/components/icons/CameraIcon";
import { DEFAULT_PROFILE_IMAGE } from "@/constants/image.constants";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type Props = Readonly<{
  shopId: string;
  visitLogCount: number;
}>;

const PAGE_SIZE = 10;

export function formatVisitedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(value));
}

export function ShopReviewSection({ shopId, visitLogCount }: Props) {
  const [visitLogs, setVisitLogs] = useState<VisitLogListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const isLoadingRef = useRef(false);

  const loadVisitLogs = useCallback(
    async (targetPage: number) => {
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        const data = await getVisitLogs(shopId, {
          page: targetPage,
          limit: PAGE_SIZE,
        });

        setVisitLogs((current) =>
          targetPage === 1 ? data.items : [...current, ...data.items],
        );

        setPage(data.pagination.page);

        setHasNextPage(data.pagination.hasNext);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsInitialized(true);
      }
    },
    [shopId],
  );

  useEffect(() => {
    void loadVisitLogs(1);
  }, [loadVisitLogs]);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isLoadingRef.current) {
      return;
    }

    void loadVisitLogs(page + 1);
  }, [hasNextPage, loadVisitLogs, page]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasNextPage,
    isLoading,
  });

  return (
    <section className="mt-2 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-16 font-semibold">후기 {visitLogCount}개</h2>

        <Link
          href={`/shops/${shopId}/reviews/new`}
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-pink-300/30 px-3 text-12 font-medium text-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <CameraIcon className="w-4 text-green-700" />
          후기 작성하기
        </Link>
      </div>

      {!isInitialized ? (
        <p className="py-10 text-center text-14 text-black-500">
          불러오는 중...
        </p>
      ) : visitLogs.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-14 text-black-500">
            아직 등록된 방문 후기가 없어요
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-7">
          {visitLogs.map((visitLog, reviewIndex) => (
            <article key={visitLog.id}>
              <div className="flex items-center gap-2">
                <Image
                  width={36}
                  height={36}
                  src={visitLog.author.profileImageUrl ?? DEFAULT_PROFILE_IMAGE}
                  alt={`${visitLog.author.nickname}의 프로필 사진`}
                  className="rounded-full object-cover"
                />

                <div>
                  <h3 className="text-14 font-semibold">
                    {visitLog.author.nickname}
                  </h3>

                  <p className="text-12 text-black-400">
                    {formatVisitedAt(visitLog.visitedAt)}
                  </p>
                </div>
              </div>

              {visitLog.imageUrls.length > 0 && (
                <div
                  className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-label={`${visitLog.author.nickname}님의 방문 사진`}
                >
                  {visitLog.imageUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative aspect-square w-[calc((100%-2rem)/2)] shrink-0 snap-start overflow-hidden rounded-lg"
                    >
                      <Image
                        fill
                        loading={
                          reviewIndex === 0 && index === 0 ? "eager" : "lazy"
                        }
                        src={url}
                        alt={`${visitLog.author.nickname}님의 방문 사진 ${index + 1}`}
                        className="object-cover"
                        sizes="(max-width: 480px) calc((100vw - 72px) / 2), 204px"
                      />
                    </div>
                  ))}
                </div>
              )}

              {visitLog.content && (
                <p className="mt-3 pb-3 text-13 leading-5 text-black-800">
                  {visitLog.content}
                </p>
              )}

              <hr className="mx-auto my-3 h-px border-0 bg-black-100/50" />
            </article>
          ))}
        </div>
      )}

      {hasNextPage && <div ref={loadMoreRef} />}

      {isInitialized && isLoading && (
        <p className="py-3 text-center text-12 text-black-400">
          불러오는 중...
        </p>
      )}
    </section>
  );
}
