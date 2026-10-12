"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CourseIcon,
  HomeIcon,
  MapIcon,
  PickIcon,
  ProfileIcon,
} from "@/components/icons";

type BottomNavigationProps = Readonly<{
  currentPath?: string;
}>;

type NavigationIconProps = Readonly<{
  name: "home" | "map" | "pick" | "course" | "me";
  active: boolean;
}>;

const NAVIGATION_ITEMS = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/map", label: "지도", icon: "map" },
  { href: "/picks", label: "내 픽", icon: "pick" },
  { href: "/me/courses", label: "코스", icon: "course" },
  { href: "/me", label: "마이페이지", icon: "me" },
] as const;

/** 현재 경로가 내비게이션 항목에 속하는지 판별합니다. */
function isNavigationItemActive(currentPath: string, href: string) {
  return href === "/"
    ? currentPath === href
    : currentPath === href || currentPath.startsWith(`${href}/`);
}

/** 겹치는 경로 중 가장 구체적인 메뉴 하나만 활성화합니다. */
function getActiveNavigationHref(currentPath: string) {
  return [...NAVIGATION_ITEMS]
    .sort((first, second) => second.href.length - first.href.length)
    .find((item) => isNavigationItemActive(currentPath, item.href))?.href;
}

/** 하단 내비게이션에서 의미를 보조하는 선형 아이콘을 표시합니다. */
function NavigationIcon({ name, active }: NavigationIconProps) {
  const className = active ? "size-5 text-brand" : "size-5";

  if (name === "home") {
    return <HomeIcon className={className} aria-hidden="true" />;
  }

  if (name === "map") {
    return <MapIcon className={className} aria-hidden="true" />;
  }

  if (name === "pick") {
    return <PickIcon className={className} aria-hidden="true" />;
  }

  if (name === "course") {
    return <CourseIcon className={className} aria-hidden="true" />;
  }

  return <ProfileIcon className={className} aria-hidden="true" />;
}

/** 주요 네 화면으로 이동하고 현재 위치를 함께 알려주는 하단 메뉴입니다. */
export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;
  const activeHref = getActiveNavigationHref(activePath);

  return (
    <nav
      aria-label="주요 메뉴"
      className="
        border-t border-green-100/10
        bg-white/95
        shadow-[0_-3px_10px_rgba(0,0,0,0.05)]
        pb-[max(0.25rem,env(safe-area-inset-bottom))]
        backdrop-blur
      "
    >
      <ul className="grid grid-cols-5">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = item.href === activeHref;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-10 font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-700",
                  isActive
                    ? "text-brand"
                    : "text-black-400 hover:text-black-800",
                ].join(" ")}
              >
                <NavigationIcon name={item.icon} active={isActive} />
                <span className={isActive ? "text-brand" : undefined}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
