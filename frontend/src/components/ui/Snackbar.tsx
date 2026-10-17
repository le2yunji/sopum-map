"use client";

import type { ReactNode } from "react";

type Props = Readonly<{
  open: boolean;
  message: ReactNode;
  action?: ReactNode;
}>;

export function Snackbar({ open, message, action }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed inset-x-4 bottom-20 z-60
        mx-auto flex h-12 max-w-[440px]
        items-center justify-between gap-3
        rounded-card bg-black-950
        px-4 py-3
        shadow-lg
      "
    >
      <div className="text-13 text-white">{message}</div>

      {action}
    </div>
  );
}
