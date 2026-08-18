import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

export type DialogVisualState = "closed" | "opening" | "open" | "closing";

const DIALOG_TRANSITION_DURATION = 250;

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
  const closeTimerRef = useRef<number | undefined>(undefined);
  const openFrameRef = useRef<number | undefined>(undefined);
  const [visualState, setVisualState] =
    useState<DialogVisualState>("closed");

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
      setVisualState("opening");
      openFrameRef.current = window.requestAnimationFrame(() => {
        setVisualState("open");
      });
      return;
    }

    if (open && dialog.open) {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = undefined;
      }
      setVisualState("open");
      return;
    }

    if (
      !open &&
      dialog.open &&
      closeTimerRef.current === undefined
    ) {
      if (openFrameRef.current !== undefined) {
        window.cancelAnimationFrame(openFrameRef.current);
        openFrameRef.current = undefined;
      }

      setVisualState("closing");
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 0
        : DIALOG_TRANSITION_DURATION;

      closeTimerRef.current = window.setTimeout(() => {
        dialog.close();
        setVisualState("closed");
        closeTimerRef.current = undefined;
        restorePageState();
      }, duration);
    }
  }, [open, restorePageState]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (openFrameRef.current !== undefined) {
        window.cancelAnimationFrame(openFrameRef.current);
      }
      restorePageState();
    },
    [restorePageState],
  );

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
    visualState,
    handleCancel,
    handleKeyDown,
    handleBackdropPointerDown,
  };
}
