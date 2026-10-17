import type { SVGProps } from "react";

/** 현재 화면의 링크를 외부로 공유하는 동작을 나타냅니다. */
export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 15V3m0 0L8 7m4-4 4 4M5 11v8h14v-8"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
