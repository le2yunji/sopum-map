import type { ReactNode } from "react";

export interface FilterChipItem {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface FilterChipGroupProps {
  items: FilterChipItem[];
  selectedValue?: string;
  selectedValues?: string[];
  ariaLabel: string;
  onValueChange: (value: string) => void;
  className?: string;
}
