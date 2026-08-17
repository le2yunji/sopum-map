import type { SVGProps } from "react";

/** 계정 설정을 나타내는 선형 톱니 아이콘입니다. */
export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M9.7 4.2 10.2 2h3.6l.5 2.2 1.5.9 2.2-.7 1.8 3.1-1.7 1.5v1.9l1.7 1.5-1.8 3.1-2.2-.7-1.5.9-.5 2.2h-3.6l-.5-2.2-1.5-.9-2.2.7-1.8-3.1L5.9 11V9L4.2 7.5 6 4.4l2.2.7 1.5-.9Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}
