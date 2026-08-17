import type { SVGProps } from "react";

/** 찜한 항목을 나타내는 선형 별 아이콘입니다. */
export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="m12 3.8 2.45 4.96 5.47.8-3.96 3.85.94 5.45L12 16.3l-4.9 2.56.94-5.45-3.96-3.85 5.47-.8L12 3.8Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
