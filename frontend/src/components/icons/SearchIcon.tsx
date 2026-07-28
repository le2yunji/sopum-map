import type { ComponentProps } from "react";

type SearchProps = ComponentProps<"svg">;

export const SearchIcon = ({ className, ...props }: SearchProps) => {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
