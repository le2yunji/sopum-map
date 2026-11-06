"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  COLLAPSED_HEIGHT,
  DRAG_START_THRESHOLD,
  SNAP_DURATION,
} from "./courseVisitOrderSheet.constants";
import { getNextCourseVisitOrderSheetState } from "./courseVisitOrderSheet";
import type { CourseVisitOrderSheetState } from "./courseVisitOrderSheet.types";

type Options = Readonly<{
  state: CourseVisitOrderSheetState;
  expandedTopOffset: number;
  onStateChange: (state: CourseVisitOrderSheetState) => void;
}>;

/** 방문순서 시트의 위치, 드래그, 목록 스크롤과 스냅을 관리합니다. */
export function useCourseVisitOrderSheetGesture({
  state,
  expandedTopOffset,
  onStateChange,
}: Options) {
  const isExpanded = state === "expanded";
  const sheetRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [initialTransform] = useState(
    () => `translate3d(0, calc(100% - ${COLLAPSED_HEIGHT}px), 0)`,
  );
  const dragStartYRef = useRef(0);
  const dragStartTranslateYRef = useRef(0);
  const currentTranslateYRef = useRef(0);
  const collapsedTranslateYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  /** 부모 높이에서 상단 여백을 제외한 시트 높이를 계산합니다. */
  const getExpandedHeight = useCallback(() => {
    const parentHeight = sheetRef.current?.parentElement?.clientHeight;

    if (!parentHeight) {
      return COLLAPSED_HEIGHT;
    }

    return Math.max(parentHeight - expandedTopOffset, COLLAPSED_HEIGHT);
  }, [expandedTopOffset]);

  /** 접힌 상태가 되기 위해 시트를 아래로 옮길 거리를 계산합니다. */
  const getCollapsedTranslateY = useCallback(
    () => Math.max(getExpandedHeight() - COLLAPSED_HEIGHT, 0),
    [getExpandedHeight],
  );

  /** 예약된 화면 갱신을 취소해 이전 드래그가 남지 않게 합니다. */
  const cancelPendingFrame = useCallback(() => {
    if (animationFrameRef.current === null) {
      return;
    }

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }, []);

  /** React 렌더링 없이 현재 시트 위치를 화면에 반영합니다. */
  const applyTranslateY = useCallback(
    (translateY: number, withTransition = false) => {
      const sheet = sheetRef.current;

      if (!sheet) {
        return;
      }

      currentTranslateYRef.current = translateY;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      sheet.style.transition =
        withTransition && !reduceMotion
          ? `transform ${SNAP_DURATION}ms ease-out`
          : "none";
      sheet.style.transform = `translate3d(0, ${translateY}px, 0)`;
    },
    [],
  );

  /** 외부 상태에 맞는 접힘 또는 펼침 위치로 시트를 옮깁니다. */
  const syncSheetPosition = useCallback(
    (withTransition = false) => {
      const collapsedTranslateY = getCollapsedTranslateY();
      collapsedTranslateYRef.current = collapsedTranslateY;
      applyTranslateY(isExpanded ? 0 : collapsedTranslateY, withTransition);
    }, [applyTranslateY, getCollapsedTranslateY, isExpanded]);

  /** 주어진 화면 위치에서 시트 드래그를 시작합니다. */
  const startDrag = useCallback(
    (clientY: number, startTranslateY: number) => {
      cancelPendingFrame();
      collapsedTranslateYRef.current = getCollapsedTranslateY();
      isDraggingRef.current = true;
      didDragRef.current = false;
      dragStartYRef.current = clientY;
      dragStartTranslateYRef.current = startTranslateY;
      currentTranslateYRef.current = startTranslateY;
    },
    [cancelPendingFrame, getCollapsedTranslateY],
  );

  /** 시트가 펼침과 접힘 범위 안에서 포인터를 따라가게 합니다. */
  const moveDrag = useCallback(
    (clientY: number) => {
      if (!isDraggingRef.current) {
        return;
      }

      const deltaY = clientY - dragStartYRef.current;

      if (Math.abs(deltaY) >= DRAG_START_THRESHOLD) {
        didDragRef.current = true;
      }

      if (!didDragRef.current) {
        return;
      }

      const nextTranslateY = Math.min(
        Math.max(dragStartTranslateYRef.current + deltaY, 0),
        collapsedTranslateYRef.current,
      );

      cancelPendingFrame();
      animationFrameRef.current = requestAnimationFrame(() => {
        applyTranslateY(nextTranslateY);
        animationFrameRef.current = null;
      });
    },
    [applyTranslateY, cancelPendingFrame],
  );

  /** 드래그 종료 위치에서 가까운 시트 상태로 붙입니다. */
  const finishDrag = useCallback(
    (clientY: number) => {
      if (!isDraggingRef.current) {
        return;
      }

      isDraggingRef.current = false;
      cancelPendingFrame();

      if (!didDragRef.current) {
        return;
      }

      const collapsedTranslateY = collapsedTranslateYRef.current;
      const nextState = getNextCourseVisitOrderSheetState({
        deltaY: clientY - dragStartYRef.current,
        currentTranslateY: currentTranslateYRef.current,
        collapsedTranslateY,
      });

      applyTranslateY(nextState === "expanded" ? 0 : collapsedTranslateY, true);

      if (nextState !== state) {
        onStateChange(nextState);
      }
    },
    [applyTranslateY, cancelPendingFrame, onStateChange, state],
  );

  /** 취소된 드래그를 현재 상태가 가리키는 위치로 되돌립니다. */
  const cancelDrag = useCallback(() => {
    isDraggingRef.current = false;
    didDragRef.current = false;
    cancelPendingFrame();
    applyTranslateY(isExpanded ? 0 : collapsedTranslateYRef.current, true);
  }, [applyTranslateY, cancelPendingFrame, isExpanded]);

  useEffect(() => {
    syncSheetPosition(true);
  }, [syncSheetPosition]);

  useEffect(() => {
    const parent = sheetRef.current?.parentElement;

    if (!parent) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!isDraggingRef.current) {
        syncSheetPosition();
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, [syncSheetPosition]);

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    let startY = 0;
    let lastY = 0;
    let draggingList = false;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      startY = event.touches[0].clientY;
      lastY = startY;
      draggingList = false;
      suppressNextClickRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const clientY = event.touches[0].clientY;
      const canPullExpandedSheet = isExpanded && list.scrollTop === 0;
      const canMoveCollapsedSheet = !isExpanded;

      if (!draggingList) {
        const movingDown = clientY > lastY;
        const canBegin = canMoveCollapsedSheet || (canPullExpandedSheet && movingDown);

        if (!canBegin || Math.abs(clientY - startY) < DRAG_START_THRESHOLD) {
          lastY = clientY;
          return;
        }

        draggingList = true;
        suppressNextClickRef.current = true;
        startDrag(startY, isExpanded ? 0 : getCollapsedTranslateY());
      }

      event.preventDefault();
      moveDrag(clientY);
      lastY = clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (draggingList) {
        finishDrag(event.changedTouches[0]?.clientY ?? lastY);
      }
      draggingList = false;
    };

    const handleTouchCancel = () => {
      if (draggingList) {
        cancelDrag();
      }
      draggingList = false;
    };

    list.addEventListener("touchstart", handleTouchStart, { passive: true });
    list.addEventListener("touchmove", handleTouchMove, { passive: false });
    list.addEventListener("touchend", handleTouchEnd, { passive: true });
    list.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      list.removeEventListener("touchstart", handleTouchStart);
      list.removeEventListener("touchmove", handleTouchMove);
      list.removeEventListener("touchend", handleTouchEnd);
      list.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    cancelDrag,
    finishDrag,
    getCollapsedTranslateY,
    isExpanded,
    moveDrag,
    startDrag,
  ]);

  useEffect(
    () => () => {
      cancelPendingFrame();
    },
    [cancelPendingFrame],
  );

  /** 손잡이를 누르면 접힘과 펼침 상태를 전환합니다. */
  const toggleSheet = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    onStateChange(isExpanded ? "collapsed" : "expanded");
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startDrag(
      event.clientY,
      isExpanded ? 0 : getCollapsedTranslateY(),
    );
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    moveDrag(event.clientY);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag(event.clientY);
  };

  const handleListClickCapture: MouseEventHandler<HTMLOListElement> = (
    event,
  ) => {
    if (!suppressNextClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressNextClickRef.current = false;
  };

  return {
    sheetRef,
    listRef,
    initialTransform,
    toggleSheet,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel: cancelDrag,
    handleListClickCapture,
  };
}
