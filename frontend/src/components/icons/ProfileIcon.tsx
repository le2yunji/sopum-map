import type { SVGProps } from "react";

/** 사용자 프로필을 나타내는 선형 아이콘입니다. */
export function ProfileIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth={1.7} />
      <path
        d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}
