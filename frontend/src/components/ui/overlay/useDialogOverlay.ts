import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";

export type DialogVisualState = "closed" | "opening" | "open" | "closing";

const DIALOG_TRANSITION_DURATION = 250;

type PageOverflowState = Readonly<{
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  documentElementOverflow: string;
  scrollX: number;
  scrollY: number;
}>;

let pageScrollLockCount = 0;
let pageOverflowState: PageOverflowState | null = null;

/** 첫 overlay가 열릴 때 문서 전체의 스크롤 상태를 저장하고 잠급니다. */
function lockPageScroll() {
  if (pageScrollLockCount === 0) {
    pageOverflowState = {
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      documentElementOverflow: document.documentElement.style.overflow,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  }

  pageScrollLockCount += 1;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${pageOverflowState?.scrollY ?? 0}px`;
  document.body.style.width = "100%";
  document.documentElement.style.overflow = "hidden";
}

/** 마지막 overlay가 닫힐 때만 원래 스크롤 상태를 복원합니다. */
function unlockPageScroll() {
  if (pageScrollLockCount === 0) {
    return;
  }

  pageScrollLockCount -= 1;

  if (pageScrollLockCount > 0 || !pageOverflowState) {
    return;
  }

  const previousState = pageOverflowState;

  document.body.style.overflow = previousState.bodyOverflow;
  document.body.style.position = previousState.bodyPosition;
  document.body.style.top = previousState.bodyTop;
  document.body.style.width = previousState.bodyWidth;
  document.documentElement.style.overflow =
    previousState.documentElementOverflow;
  pageOverflowState = null;
  window.scrollTo(previousState.scrollX, previousState.scrollY);
}

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
  const hasScrollLockRef = useRef(false);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const openFrameRef = useRef<number | undefined>(undefined);
  const [visualState, setVisualState] = useState<DialogVisualState>("closed");

  /** overlay가 바꾼 스크롤과 포커스를 원래 상태로 되돌립니다. */
  const restorePageState = useCallback(() => {
    if (hasScrollLockRef.current) {
      unlockPageScroll();
      hasScrollLockRef.current = false;
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
      lockPageScroll();
      hasScrollLockRef.current = true;
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

    if (!open && dialog.open && closeTimerRef.current === undefined) {
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

  /** 완료된 backdrop 클릭만 닫아 같은 터치가 뒤쪽 요소로 전달되지 않게 합니다. */
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  return {
    dialogRef,
    visualState,
    handleCancel,
    handleKeyDown,
    handleBackdropClick,
  };
}
