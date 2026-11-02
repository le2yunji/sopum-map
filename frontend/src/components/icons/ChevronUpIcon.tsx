import type { SVGProps } from "react";

/** 위쪽 방향을 가리키는 꺾쇠 아이콘을 표시합니다. */
export function ChevronUpIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M4 16L12 8L20 16"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
