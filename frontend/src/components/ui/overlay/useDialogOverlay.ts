import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

type UseDialogOverlayOptions = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdrop: boolean;
}>;

/** 네이티브 dialog의 제어 상태, 닫기 동작, 문서 상태 복구를 관리합니다. */
export function useDialogOverlay({
  open,
  onOpenChange,
  closeOnBackdrop,
}: UseDialogOverlayOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef<string | null>(null);

  /** overlay가 바꾼 스크롤과 포커스를 원래 상태로 되돌립니다. */
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

  useEffect(() => restorePageState, [restorePageState]);

  /** Escape 요청을 제어 상태 변경으로 전달합니다. */
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onOpenChange(false);
  };

  /** 테스트 환경을 포함한 브라우저별 Escape 동작을 동일하게 보장합니다. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  /** 패널 바깥의 실제 backdrop을 누른 경우에만 닫기를 요청합니다. */
  const handleBackdropPointerDown = (
    event: PointerEvent<HTMLDialogElement>,
  ) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  return {
    dialogRef,
    handleCancel,
    handleKeyDown,
    handleBackdropPointerDown,
  };
}
