import type { ReactNode } from "react";

export type ModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeOnBackdrop?: boolean;
  className?: string;
}>;
