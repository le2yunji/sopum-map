"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import type { ModalProps } from "./Modal.types";

type ModalSectionProps = ComponentPropsWithoutRef<"div">;
type ModalTitleProps = ComponentPropsWithoutRef<"h2">;

type ModalCompoundComponent = ((props: ModalProps) => React.JSX.Element) & {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
};

/** 제어 상태를 브라우저의 모달 대화상자 상태와 동기화합니다. */
function ModalRoot({
  open,
  onOpenChange,
  children,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  closeOnBackdrop = true,
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string | null>(null);

  /** Modal이 바꾼 문서 상태를 원래 값으로 안전하게 되돌립니다. */
  const restorePageState = useCallback(() => {
    if (previousOverflowRef.current !== null) {
      document.body.style.overflow = previousOverflowRef.current;
      previousOverflowRef.current = null;
    }

    const previousFocus = previousFocusRef.current;
    previousFocusRef.current = null;

    if (previousFocus) {
      window.requestAnimationFrame(() => previousFocus.focus());
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      previousOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
      restorePageState();
    }
  }, [open, restorePageState]);

  useEffect(() => {
    return restorePageState;
  }, [restorePageState]);

  /** Escape 요청을 제어 상태 변경으로 전달 */
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onOpenChange(false);
  };

  /** 키보드 테스트와 브라우저 차이에도 Escape 닫기를 동일하게 보장 */
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  /** 패널 바깥의 실제 backdrop을 누른 경우에만 닫기를 요청 */
  const handleBackdropPointerDown = (
    event: PointerEvent<HTMLDialogElement>,
  ) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      onPointerDown={handleBackdropPointerDown}
      className="m-auto max-h-[calc(100dvh-2.5rem)] w-[calc(100%-2.5rem)] max-w-[329px] overflow-visible bg-transparent p-0 text-black-950 backdrop:bg-black-950/45 motion-safe:transition-opacity"
    >
      <div
        className={[
          "max-h-[calc(100dvh-2.5rem)] overflow-y-auto rounded-[20px] bg-white p-6",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </dialog>
  );
}

/** Modal 상단의 시각 요소와 제목을 일정한 간격으로 배치 */
function ModalHeader({ className = "", ...props }: ModalSectionProps) {
  return (
    <div
      {...props}
      className={["flex flex-col items-center gap-2", className].join(" ")}
    />
  );
}

/** Modal의 접근 가능한 주제를 제목 계층으로 표시 */
function ModalTitle({ className = "", ...props }: ModalTitleProps) {
  return (
    <h2
      {...props}
      className={[
        "text-center text-16 font-regular leading-8 text-black-950",
        className,
      ].join(" ")}
    />
  );
}

/** Modal의 설명 콘텐츠를 피그마 본문 규격으로 배치 */
function ModalBody({ className = "", ...props }: ModalSectionProps) {
  return (
    <div
      {...props}
      className={[
        "mt-6 text-center text-14 leading-[26px] text-black-800",
        className,
      ].join(" ")}
    />
  );
}

/** Modal의 주요 닫기 또는 확인 액션을 하단에 배치 */
function ModalFooter({ className = "", ...props }: ModalSectionProps) {
  return (
    <div
      {...props}
      className={["mx-auto mt-4 flex w-full max-w-[284px]", className].join(
        " ",
      )}
    />
  );
}

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
}) as ModalCompoundComponent;
