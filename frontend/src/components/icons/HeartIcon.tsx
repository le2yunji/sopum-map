import type { SVGProps } from "react";

type HeartIconProps = SVGProps<SVGSVGElement> & {
  filled?: boolean;
};

export function HeartIcon({
  filled = false,
  className,
  ...props
}: HeartIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 6.90908C12 6.90908 13.4999 4 16.5429 4C19.0159 4 20.9742 6.00636 20.9995 8.40044C21.0506 13.37 16.9338 16.904 12.4219 19.874C12.2975 19.9561 12.1505 20 12 20C11.8495 20 11.7026 19.9561 11.5782 19.874C7.06573 16.904 2.94892 13.37 3.00048 8.40044C3.02579 6.00636 4.98412 4 7.45712 4C10.5001 4 12 6.90908 12 6.90908Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
