import type { SVGProps } from "react";

type LocationIconProps = SVGProps<SVGSVGElement> & {
  filled?: boolean;
};

export function LocationIcon({
  filled = false,
  className,
  ...props
}: LocationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20 11C20 16.396 14.104 20.108 12.435 21.05C12.3027 21.1264 12.1527 21.1666 12 21.1666C11.8473 21.1666 11.6973 21.1264 11.565 21.05C9.895 20.108 4 16.396 4 11C4 8.87827 4.84285 6.84344 6.34315 5.34315C7.84344 3.84285 9.87827 3 12 3C14.1217 3 16.1566 3.84285 17.6569 5.34315C19.1571 6.84344 20 8.87827 20 11Z"
        fill={filled ? "var(--green-700)" : "none"}
        stroke={filled ? "var(--green-700)" : "currentColor"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="11"
        r="3"
        fill={filled ? "white" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={1.5}
      />
    </svg>
  );
}
