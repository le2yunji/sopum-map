import type { SVGProps } from "react";

/** 저장한 내 픽을 나타내는 선형 아이콘입니다. */
export function PickIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M6 4.5h12v16L12 17l-6 3.5z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}
