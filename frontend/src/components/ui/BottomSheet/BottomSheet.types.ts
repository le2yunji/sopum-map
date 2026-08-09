import type { ReactNode } from "react";

type BottomSheetAccessibleName =
  | Readonly<{
      ariaLabel: string;
      ariaLabelledBy?: never;
    }>
  | Readonly<{
      ariaLabel?: never;
      ariaLabelledBy: string;
    }>;

export type BottomSheetProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  ariaDescribedBy?: string;
  closeOnBackdrop?: boolean;
  className?: string;
}> &
  BottomSheetAccessibleName;
