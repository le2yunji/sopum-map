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
              text-14 transition-colors       
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-black-950
              focus-visible:ring-offset-2
              ${
                isSelected
                  ? `
                    border-black-950 bg-black-950
                    font-bold text-white
                  `
                  : `
                    border-black-100 bg-white
                    font-medium text-black-800
                    hover:border-black-300
                    hover:bg-black-100/50
                    active:bg-black-100
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
