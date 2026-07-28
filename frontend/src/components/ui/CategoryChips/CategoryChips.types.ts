export interface CategoryChipItem {
  value: string;
  label: string;
}

export interface CategoryChipsProps {
  items: CategoryChipItem[];
  selectedValue?: string;
  ariaLabel: string;
  onValueChange: (value: string) => void;
  className?: string;
}
