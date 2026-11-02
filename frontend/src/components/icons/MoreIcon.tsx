import type { SVGProps } from "react";

/** 세로로 놓인 점 세 개의 더보기 아이콘을 표시합니다. */
export function MoreIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.55 13.5C12.2404 13.5 12.8 12.9404 12.8 12.25C12.8 11.5596 12.2404 11 11.55 11C10.8596 11 10.3 11.5596 10.3 12.25C10.3 12.9404 10.8596 13.5 11.55 13.5Z"
        fill="currentColor"
      />
      <path
        d="M11.55 8.5C12.2404 8.5 12.8 7.94036 12.8 7.25C12.8 6.55964 12.2404 6 11.55 6C10.8596 6 10.3 6.55964 10.3 7.25C10.3 7.94036 10.8596 8.5 11.55 8.5Z"
        fill="currentColor"
      />
      <path
        d="M11.55 18.5C12.2404 18.5 12.8 17.9404 12.8 17.25C12.8 16.5596 12.2404 16 11.55 16C10.8596 16 10.3 16.5596 10.3 17.25C10.3 17.9404 10.8596 18.5 11.55 18.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
