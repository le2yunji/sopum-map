import type { SVGProps } from "react";

/** 지도 화면을 나타내는 선형 아이콘입니다. */
export function MapIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="m3.5 6 5-2 7 2 5-2v14l-5 2-7-2-5 2zM8.5 4v14m7-12v14"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}
