"use client";

import type { CategoryChipsProps } from "./CategoryChips.types";

export const CategoryChips = ({
  items,
  selectedValue,
  ariaLabel,
  onValueChange,
  className = "",
}: CategoryChipsProps) => {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`
        flex w-full gap-2 overflow-x-auto
        overscroll-x-contain scroll-smooth
        scrollbar-none
        [&::-webkit-scrollbar]:hidden
        ${className}
      `}
    >
      {items.map((item) => {
        const isSelected = selectedValue === item.value;

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onValueChange(item.value)}
            className={`
              shrink-0 whitespace-nowrap rounded-full
              border px-4 py-2
              text-sm 
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-gray-900
              focus-visible:ring-offset-2
              ${
                isSelected
                  ? "border-gray-900 bg-foreground text-white font-bold"
                  : `
                    font-medium border-border bg-white text-gray-600 
                    hover:border-gray-300 hover:bg-gray-50
                  `
              }
            `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
