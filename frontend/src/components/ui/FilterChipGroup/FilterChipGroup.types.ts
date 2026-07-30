export interface FilterChipItem {
  value: string;
  label: string;
}

export interface FilterChipGroupProps {
  items: FilterChipItem[];
  selectedValue?: string;
  ariaLabel: string;
  onValueChange: (value: string) => void;
  className?: string;
}
