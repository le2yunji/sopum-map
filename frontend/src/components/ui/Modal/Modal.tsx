"use client";

import { useEffect, useRef } from "react";

import type { ModalProps } from "./Modal.types";

/** 제어 상태를 브라우저의 모달 대화상자 상태와 동기화합니다. */
export function Modal({
  open,
  children,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className="m-auto max-h-[calc(100dvh-2.5rem)] w-[calc(100%-2.5rem)] max-w-[329px] overflow-visible bg-transparent p-0 text-black-950 backdrop:bg-black-950/45"
    >
      <div className={["rounded-[20px] bg-white p-6", className].join(" ")}>
        {children}
      </div>
    </dialog>
  );
}
