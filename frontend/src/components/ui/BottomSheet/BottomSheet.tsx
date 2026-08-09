"use client";

import { useDialogOverlay } from "../overlay/useDialogOverlay";
import type { BottomSheetProps } from "./BottomSheet.types";

/** 모바일 화면 아래에 제어형 대화상자를 표시합니다. */
function BottomSheetRoot({
  open,
  onOpenChange,
  children,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  closeOnBackdrop = true,
  className = "",
}: BottomSheetProps) {
  const {
    dialogRef,
    handleCancel,
    handleKeyDown,
    handleBackdropPointerDown,
  } = useDialogOverlay({ open, onOpenChange, closeOnBackdrop });

  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      onPointerDown={handleBackdropPointerDown}
      className="mx-auto mt-auto mb-0 max-h-[calc(100dvh-1.25rem)] w-full max-w-[480px] overflow-visible bg-transparent p-0 text-black-950 backdrop:bg-black-950/45"
    >
      <div
        className={[
          "relative max-h-[calc(100dvh-1.25rem)] overflow-y-auto rounded-t-[20px] bg-white px-6 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </dialog>
  );
}

export const BottomSheet = BottomSheetRoot;
