"use client";

import type { FilterChipGroupProps } from "./FilterChipGroup.types";

export const FilterChipGroup = ({
  items,
  selectedValue,
  selectedValues,
  ariaLabel,
  onValueChange,
  className = "",
}: FilterChipGroupProps) => {
  const activeValues = selectedValues ?? (selectedValue ? [selectedValue] : []);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`
        flex gap-2 overflow-x-auto
        overscroll-x-contain scroll-smooth
        scrollbar-none
        [&::-webkit-scrollbar]:hidden
        ${className}
      `}
    >
      {items.map((item) => {
        const isSelected = activeValues.includes(item.value);

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onValueChange(item.value)}
            className={`
              shrink-0 whitespace-nowrap rounded-full
              flex items-center gap-1.5 border px-4 py-2 max-h-9
              text-14 transition-colors       
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-green-950
              focus-visible:ring-offset-2
              ${
                isSelected
                  ? `
                    border-green-700 bg-transparent
                    font-semibold text-green-800
                  `
                  : `
                    border-black-200 bg-transparent
                    font-medium text-black-800
                    hover:border-green-300 hover:text-green-800
                    active:border-green-500
                  `
              }
            `}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
