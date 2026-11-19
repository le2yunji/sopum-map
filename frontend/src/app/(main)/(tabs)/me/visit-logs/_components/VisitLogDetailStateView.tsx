"use client";

import { ChevronLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

import { VisitLogDetailModalShell } from "./VisitLogDetailModal";

type Props = Readonly<{
  mode: "page" | "modal";
  status: "loading" | "error";
  onClose: () => void;
  onRetry: () => void;
}>;

/** 상세 조회 중이거나 실패했을 때도 페이지와 모달의 자리를 유지합니다. */
export function VisitLogDetailStateView({
  mode,
  status,
  onClose,
  onRetry,
}: Props) {
  const content =
    status === "loading" ? (
      <div
        role="status"
        aria-label="방문 로그 상세를 불러오는 중"
        className="bg-white pb-8"
      >
        <Skeleton
          announce={false}
          className={`${
            mode === "modal" ? "aspect-[4/3]" : "aspect-square"
          } rounded-none`}
        />
        <div className="space-y-3 px-5 pt-5">
          <Skeleton announce={false} className="h-4 w-28 rounded-control" />
          <Skeleton announce={false} className="h-8 w-48 rounded-control" />
          <Skeleton announce={false} className="h-4 w-56 rounded-control" />
          <Skeleton announce={false} className="mt-5 h-20 rounded-control" />
        </div>
      </div>
    ) : (
      <section className="grid min-h-[calc(100dvh-3.5rem)] place-items-center bg-white px-5 text-center">
        <div>
          <p className="text-16 text-black-700">
            방문 로그를 불러오지 못했습니다
          </p>
          <p className="mt-2 text-14 text-black-700">
            잠시 후 다시 시도해 주세요.
          </p>
          <Button variant="outline" className="mt-5" onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      </section>
    );

  if (mode === "modal") {
    return (
      <VisitLogDetailModalShell
        open
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
      >
        {content}
      </VisitLogDetailModalShell>
    );
  }

  return (
    <main className="min-h-dvh bg-white pb-24">
      <header className="sticky top-0 z-20 flex min-h-14 items-center gap-1 border-b border-black-100 bg-white/95 px-3 backdrop-blur-sm">
        <Button
          iconOnly
          size="small"
          variant="ghost"
          aria-label="방문 로그 목록으로 이동"
          onClick={onClose}
        >
          <ChevronLeftIcon />
        </Button>

        <h1 className="text-16 font-semibold">방문 로그</h1>
      </header>

      {content}
    </main>
  );
}
