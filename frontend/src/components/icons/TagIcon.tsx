import type { SVGProps } from "react";

type TagIconProps = SVGProps<SVGSVGElement> & {
  selected?: boolean;
};

export function TagIcon({ selected = false, ...props }: TagIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 8.32692H19M4 14.6731H19M16.4038 4L13.5192 19M10.0577 4L7.17308 19"
        stroke={selected ? "#FFFFFF" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
