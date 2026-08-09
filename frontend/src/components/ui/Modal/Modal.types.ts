import type { ReactNode } from "react";

type ModalAccessibleName =
  | Readonly<{
      ariaLabel: string;
      ariaLabelledBy?: never;
    }>
  | Readonly<{
      ariaLabel?: never;
      ariaLabelledBy: string;
    }>;

export type ModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  ariaDescribedBy?: string;
  closeOnBackdrop?: boolean;
  className?: string;
}> &
  ModalAccessibleName;
