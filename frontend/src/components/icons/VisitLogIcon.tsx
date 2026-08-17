import type { SVGProps } from "react";

/** 방문한 장소를 나타내는 접힌 지도 아이콘입니다. */
export function VisitLogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="m3.5 6 5-2 7 2 5-2v14l-5 2-7-2-5 2V6Zm5-2v14m7-12v14"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
