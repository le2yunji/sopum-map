"use client";

import type { ComponentPropsWithoutRef } from "react";

import { useDialogOverlay } from "../overlay/useDialogOverlay";
import type { BottomSheetProps } from "./BottomSheet.types";

type BottomSheetSectionProps = ComponentPropsWithoutRef<"div">;
type BottomSheetTitleProps = ComponentPropsWithoutRef<"h2">;

type BottomSheetCompoundComponent = ((
  props: BottomSheetProps,
) => React.JSX.Element) & {
  Handle: typeof BottomSheetHandle;
  Header: typeof BottomSheetHeader;
  Title: typeof BottomSheetTitle;
  Body: typeof BottomSheetBody;
  Footer: typeof BottomSheetFooter;
};

/** 모바일 화면 아래에 제어형 대화상자를 표시합니다. */
function BottomSheetRoot({
  open,
  onOpenChange,
  children,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  closeOnBackdrop = true,
  showCloseButton = false,
  closeButtonLabel = "닫기",
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
        {showCloseButton ? (
          <button
            type="button"
            aria-label={closeButtonLabel}
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-4 grid size-8 place-items-center rounded-full text-black-700 hover:bg-black-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        ) : null}
        {children}
      </div>
    </dialog>
  );
}

/** BottomSheet의 시작점을 알려주는 장식 손잡이를 표시합니다. */
function BottomSheetHandle({ className = "", ...props }: BottomSheetSectionProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={[
        "mx-auto h-1.5 w-12 rounded-full bg-black-200",
        className,
      ].join(" ")}
    />
  );
}

/** BottomSheet 제목 영역을 일정한 간격으로 배치합니다. */
function BottomSheetHeader({ className = "", ...props }: BottomSheetSectionProps) {
  return <div {...props} className={["mt-6", className].join(" ")} />;
}

/** BottomSheet의 접근 가능한 주제를 제목 계층으로 표시합니다. */
function BottomSheetTitle({ className = "", ...props }: BottomSheetTitleProps) {
  return (
    <h2
      {...props}
      className={[
        "text-20 font-semibold leading-7 text-black-950",
        className,
      ].join(" ")}
    />
  );
}

/** 선택 항목이나 기능 콘텐츠를 본문 영역에 배치합니다. */
function BottomSheetBody({ className = "", ...props }: BottomSheetSectionProps) {
  return <div {...props} className={["mt-6", className].join(" ")} />;
}

/** BottomSheet의 주요 액션을 하단에 배치합니다. */
function BottomSheetFooter({ className = "", ...props }: BottomSheetSectionProps) {
  return (
    <div
      {...props}
      className={["mt-6 flex w-full", className].join(" ")}
    />
  );
}

export const BottomSheet = Object.assign(BottomSheetRoot, {
  Handle: BottomSheetHandle,
  Header: BottomSheetHeader,
  Title: BottomSheetTitle,
  Body: BottomSheetBody,
  Footer: BottomSheetFooter,
}) as BottomSheetCompoundComponent;
