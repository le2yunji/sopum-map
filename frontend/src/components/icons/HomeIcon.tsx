import type { SVGProps } from "react";

/** 홈 화면을 나타내는 선형 아이콘입니다. */
export function HomeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}
