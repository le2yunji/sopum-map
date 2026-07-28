import type { ComponentProps } from "react";

type SearchProps = ComponentProps<"svg">;

export const LoadingIcon = ({ className, ...props }: SearchProps) => {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={`animate-spin ${className ?? ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        className="opacity-75"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
};
