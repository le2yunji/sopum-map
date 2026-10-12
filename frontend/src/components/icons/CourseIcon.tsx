import type { SVGProps } from "react";

/** 두 지점을 잇는 코스 경로를 표시합니다. */
export function CourseIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 6v10a4 4 0 0 0 8 0V8a4 4 0 0 1 8 0v10"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth={1.7} />
      <circle cx="20" cy="20" r="2" stroke="currentColor" strokeWidth={1.7} />
    </svg>
  );
}
