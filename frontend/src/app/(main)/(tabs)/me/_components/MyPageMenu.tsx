"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { CameraIcon, ChevronRightIcon, CourseIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { useMyActivitySummary } from "@/hooks/useMyActivitySummary";

type ActivityItem = Readonly<{
  label: string;
  count: number;
  href: string;
  icon: ReactNode;
}>;

type ActivityMenuListProps = Readonly<{
  visitLogCount: number;
  createdCourseCount: number;
}>;

/** 방문 기록과 생성한 코스 수를 서버의 활동 집계로 표시합니다. */
export function MyPageActivityMenu({
  isEmpty,
}: Readonly<{ isEmpty: boolean }>) {
  const activitySummaryQuery = useMyActivitySummary(!isEmpty);

  if (isEmpty) {
    return <ActivityMenuList visitLogCount={0} createdCourseCount={0} />;
  }

  if (activitySummaryQuery.isPending) {
    return (
      <Skeleton
        label="활동 요약을 불러오는 중"
        className="mt-4 h-30 rounded-card"
      />
    );
  }

  if (activitySummaryQuery.isError) {
    return (
      <section
        aria-label="내 활동"
        className="mt-4 rounded-card border border-black-200 p-5 text-center"
      >
        <p className="text-14 text-black-600">
          활동 요약을 불러오지 못했습니다.
        </p>

        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            void activitySummaryQuery.refetch();
          }}
        >
          활동 요약 다시 시도
        </Button>
      </section>
    );
  }

  return (
    <ActivityMenuList
      visitLogCount={activitySummaryQuery.data.visitLogCount}
      createdCourseCount={activitySummaryQuery.data.createdCourseCount}
    />
  );
}

/** 집계된 활동 수를 각각의 활동 페이지 링크로 표시합니다. */
function ActivityMenuList({
  visitLogCount,
  createdCourseCount,
}: ActivityMenuListProps) {
  const items: readonly ActivityItem[] = [
    {
      label: "방문 로그",
      count: visitLogCount,
      href: "/me/visit-logs",
      icon: <CameraIcon className="size-5" />,
    },
    {
      label: "내 산책 코스",
      count: createdCourseCount,
      href: "/me/courses",
      icon: <CourseIcon className="size-5" />,
    },
  ];

  return (
    <nav
      aria-label="내 활동"
      className="mt-4 overflow-hidden rounded-card border border-black-200"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={`${item.label} ${item.count}개 보기`}
          className="flex min-h-15 items-center gap-4 border-b border-black-200 px-5 last:border-b-0 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500"
        >
          <span className="text-green-400" aria-hidden="true">
            {item.icon}
          </span>

          <span className="flex-1 text-14 font-medium text-black-950">
            {item.label}
          </span>

          <span className="min-w-7 rounded-full bg-green-100 px-2 py-0.5 text-center text-12 font-semibold text-green-700">
            {item.count}
          </span>

          <ChevronRightIcon
            className="size-4 text-green-200"
            aria-hidden="true"
          />
        </Link>
      ))}
    </nav>
  );
}
