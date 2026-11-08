"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ChevronRightIcon, CourseIcon, CameraIcon } from "@/components/icons";
import { useInfiniteMyVisitLogs } from "@/api/visit-log/visit-log.query";

type ActivityItem = Readonly<{
  label: string;
  count: number;
  href: string;
  icon: ReactNode;
}>;

/** 방문 기록과 찜한 코스를 하나의 활동 카드로 표시합니다. */
export function MyPageActivityMenu({
  isEmpty,
}: Readonly<{ isEmpty: boolean }>) {
  const visitLogsQuery = useInfiniteMyVisitLogs();
  const visitLogCount = isEmpty
    ? 0
    : (visitLogsQuery.data?.pages[0]?.summary.totalCount ?? 0);
  const items: readonly ActivityItem[] = [
    {
      label: "방문 로그",
      count: visitLogCount,
      href: "/me/visit-logs",
      icon: <CameraIcon className="size-5" />,
    },
    {
      label: "내 산책 코스",
      count: isEmpty ? 0 : 3,
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
