"use client";

import {
  useEffect,
  useRef,
  type MouseEventHandler,
  type RefObject,
} from "react";

import { DRAG_START_THRESHOLD } from "./mapShopListSheet.constants";

type UseMapShopListTouchGestureOptions = Readonly<{
  isExpanded: boolean;
  getCollapsedTranslateY: () => number;
  startSheetDrag: (clientY: number, startTranslateY: number) => void;
  moveSheet: (clientY: number) => void;
  finishSheetDrag: (clientY: number) => void;
  cancelSheetDrag: () => void;
}>;

/** 목록은 위로 스크롤하고, 목록 맨 위에서 아래로 당길 때만 시트 드래그로 전환합니다. */
export function useMapShopListTouchGesture({
  isExpanded,
  getCollapsedTranslateY,
  startSheetDrag,
  moveSheet,
  finishSheetDrag,
  cancelSheetDrag,
}: UseMapShopListTouchGestureOptions) {
  const listRef = useRef<HTMLUListElement>(null);
  const isListGestureActiveRef = useRef(false);
  const pullStartYRef = useRef<number | null>(null);
  const lastTouchYRef = useRef(0);
  const suppressNextClickRef = useRef(false);

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const resetListGesture = () => {
      isListGestureActiveRef.current = false;
      pullStartYRef.current = null;
    };

    const beginSheetDrag = (
      event: TouchEvent,
      startY: number,
      currentY: number,
      startTranslateY: number,
    ) => {
      event.preventDefault();
      isListGestureActiveRef.current = true;
      suppressNextClickRef.current = true;
      startSheetDrag(startY, startTranslateY);
      moveSheet(currentY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const clientY = event.touches[0].clientY;

      lastTouchYRef.current = clientY;
      pullStartYRef.current = null;
      isListGestureActiveRef.current = false;
      suppressNextClickRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const clientY = event.touches[0].clientY;
      const previousY = lastTouchYRef.current;
      const touchDeltaY = clientY - previousY;
      const isMovingDown = touchDeltaY > 0;

      if (isListGestureActiveRef.current) {
        event.preventDefault();
        moveSheet(clientY);
        lastTouchYRef.current = clientY;
        return;
      }

      if (!isExpanded) {
        pullStartYRef.current ??= previousY;

        if (Math.abs(clientY - pullStartYRef.current) >= DRAG_START_THRESHOLD) {
          beginSheetDrag(
            event,
            pullStartYRef.current,
            clientY,
            getCollapsedTranslateY(),
          );
        }

        lastTouchYRef.current = clientY;
        return;
      }

      if (list.scrollTop > 0 || !isMovingDown) {
        pullStartYRef.current = null;
        lastTouchYRef.current = clientY;
        return;
      }

      pullStartYRef.current ??= previousY;

      if (clientY - pullStartYRef.current >= DRAG_START_THRESHOLD) {
        beginSheetDrag(event, pullStartYRef.current, clientY, 0);
      }

      lastTouchYRef.current = clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (isListGestureActiveRef.current) {
        finishSheetDrag(
          event.changedTouches[0]?.clientY ?? lastTouchYRef.current,
        );
      }

      resetListGesture();
    };

    const handleTouchCancel = () => {
      if (isListGestureActiveRef.current) {
        cancelSheetDrag();
      }

      resetListGesture();
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
    cancelSheetDrag,
    finishSheetDrag,
    getCollapsedTranslateY,
    isExpanded,
    moveSheet,
    startSheetDrag,
  ]);

  const handleListClickCapture: MouseEventHandler<HTMLUListElement> = (
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
    listRef: listRef as RefObject<HTMLUListElement | null>,
    handleListClickCapture,
  };
}
