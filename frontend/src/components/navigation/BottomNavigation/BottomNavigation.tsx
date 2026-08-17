"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BottomNavigationProps = Readonly<{
  currentPath?: string;
}>;

type NavigationIconProps = Readonly<{
  name: "home" | "map" | "pick" | "me";
}>;

const NAVIGATION_ITEMS = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/map", label: "지도", icon: "map" },
  { href: "/picks", label: "내 픽", icon: "pick" },
  { href: "/me", label: "마이페이지", icon: "me" },
] as const;

/** 현재 경로가 내비게이션 항목에 속하는지 판별합니다. */
function isNavigationItemActive(currentPath: string, href: string) {
  return href === "/"
    ? currentPath === href
    : currentPath === href || currentPath.startsWith(`${href}/`);
}

/** 하단 내비게이션에서 의미를 보조하는 선형 아이콘을 표시합니다. */
function NavigationIcon({ name }: NavigationIconProps) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="m3.5 6 5-2 7 2 5-2v14l-5 2-7-2-5 2zM8.5 4v14m7-12v14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "pick") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M6 4.5h12v16L12 17l-6 3.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 주요 네 화면으로 이동하고 현재 위치를 함께 알려주는 하단 메뉴입니다. */
export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;

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
      <ul className="grid grid-cols-4">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = isNavigationItemActive(activePath, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-10 font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-700",
                  isActive
                    ? "text-green-700"
                    : "text-black-400 hover:text-black-800",
                ].join(" ")}
              >
                <NavigationIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
