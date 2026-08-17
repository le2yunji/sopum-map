import Link from "next/link";
import type { ReactNode } from "react";

import {
  ChevronRightIcon,
  SettingsIcon,
  StarIcon,
  StoreIcon,
  VisitLogIcon,
} from "@/components/icons";

type ActivityItem = Readonly<{
  label: string;
  count: number;
  href: string;
  icon: ReactNode;
}>;

type MenuLinkProps = Readonly<{
  label: string;
  href: string;
  icon: ReactNode;
}>;

/** 방문 기록과 찜한 코스를 하나의 활동 카드로 표시합니다. */
export function MyPageActivityMenu({ isEmpty }: Readonly<{ isEmpty: boolean }>) {
  const items: readonly ActivityItem[] = [
    {
      label: "방문 기록",
      count: isEmpty ? 0 : 5,
      href: "/me/visit-logs",
      icon: <VisitLogIcon className="size-5" />,
    },
    {
      label: "찜한 산책 코스",
      count: isEmpty ? 0 : 3,
      href: "/me/courses",
      icon: <StarIcon className="size-5" />,
    },
  ];

  return (
    <nav aria-label="내 활동" className="mt-4 overflow-hidden rounded-2xl border border-black-200">
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
          <span className="flex-1 text-14 font-medium text-black-950">{item.label}</span>
          <span className="min-w-7 rounded-full bg-green-100 px-2 py-0.5 text-center text-12 font-semibold text-green-700">
            {item.count}
          </span>
          <ChevronRightIcon className="size-4 text-green-200" aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}

/** 제보와 계정 설정을 독립된 카드 링크로 표시합니다. */
export function MyPageSupportMenu() {
  return (
    <nav aria-label="지원 및 계정" className="mt-4 space-y-2">
      <MyPageMenuLink
        href="/shops/suggest"
        label="소품샵 제보하기"
        icon={<StoreIcon className="size-5" />}
      />
      <MyPageMenuLink
        href="/me/settings"
        label="계정 설정"
        icon={<SettingsIcon className="size-5" />}
      />
    </nav>
  );
}

/** 같은 위계의 단일 메뉴를 공통된 크기와 포커스 상태로 제공합니다. */
function MyPageMenuLink({ href, label, icon }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className="flex min-h-15 items-center gap-4 rounded-2xl border border-black-100 px-5 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
    >
      <span className="text-green-400" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1 text-14 font-medium text-black-950">{label}</span>
      <ChevronRightIcon className="size-4 text-green-200" aria-hidden="true" />
    </Link>
  );
}
