import type { ComponentProps } from "react";

type CloseIconProps = ComponentProps<"svg">;

export const CloseIcon = ({ className, ...props }: CloseIconProps) => {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
};
