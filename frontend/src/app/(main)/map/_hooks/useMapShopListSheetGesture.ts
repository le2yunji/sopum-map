"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  COLLAPSED_HEIGHT,
  EXPANDED_TOP_OFFSET,
  DRAG_START_THRESHOLD,
  SNAP_DURATION,
} from "./mapShopListSheet.constants";

import {
  getInitialTransform,
  getNextSheetState,
} from "./mapShopListSheet.utils";
import { useMapShopListTouchGesture } from "./useMapShopListTouchGesture";
import type { MapShopListSheetState } from "./mapShopListSheet.types";

type UseMapShopListSheetGestureOptions = Readonly<{
  visible: boolean;
  state: MapShopListSheetState;
  onStateChange: (state: MapShopListSheetState) => void;
}>;

/** 목록 시트의 위치, 드래그, 스냅과 크기 변화를 관리합니다. */
export function useMapShopListSheetGesture({
  visible,
  state,
  onStateChange,
}: UseMapShopListSheetGestureOptions) {
  const isExpanded = state === "expanded";
  const sheetRef = useRef<HTMLElement>(null);
  const [initialTransform] = useState(() =>
    getInitialTransform(visible, state),
  );

  const dragStartYRef = useRef(0);
  const dragStartTranslateYRef = useRef(0);
  const currentTranslateYRef = useRef(0);
  const collapsedTranslateYRef = useRef(0);
  const isSheetDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  /** 부모 높이를 기준으로 펼친 시트 높이를 계산합니다. */
  const getExpandedHeight = useCallback(() => {
    const parentHeight = sheetRef.current?.parentElement?.clientHeight;

    if (!parentHeight) {
      return COLLAPSED_HEIGHT;
    }

    return Math.max(parentHeight - EXPANDED_TOP_OFFSET, COLLAPSED_HEIGHT);
  }, []);

  /** 접힌 상태에서 시트가 아래로 이동할 거리를 계산합니다. */
  const getCollapsedTranslateY = useCallback(() => {
    return Math.max(getExpandedHeight() - COLLAPSED_HEIGHT, 0);
  }, [getExpandedHeight]);

  /** 예약된 transform 갱신 프레임을 취소합니다. */
  const cancelPendingFrame = useCallback(() => {
    if (animationFrameRef.current === null) {
      return;
    }

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }, []);

  /** React 리렌더링 없이 시트 transform을 갱신합니다. */
  const applyTranslateY = useCallback(
    (translateY: number, withTransition = false) => {
      const sheet = sheetRef.current;

      if (!sheet) {
        return;
      }

      currentTranslateYRef.current = translateY;

      if (!withTransition) {
        sheet.style.transition = "none";
      } else {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        sheet.style.transition = reduceMotion
          ? "none"
          : `transform ${SNAP_DURATION}ms ease-out`;
      }

      sheet.style.transform = `translate3d(0, ${translateY}px, 0)`;
    },
    [],
  );

  /** 외부 상태에 맞춰 현재 시트 위치를 동기화합니다. */
  const syncSheetPosition = useCallback(
    (withTransition = false) => {
      const collapsedTranslateY = getCollapsedTranslateY();

      collapsedTranslateYRef.current = collapsedTranslateY;

      const translateY = visible
        ? isExpanded
          ? 0
          : collapsedTranslateY
        : getExpandedHeight();

      applyTranslateY(translateY, withTransition);
    },
    [
      applyTranslateY,
      getCollapsedTranslateY,
      getExpandedHeight,
      isExpanded,
      visible,
    ],
  );

  /** 현재 포인터 위치에서 시트 드래그를 시작합니다. */
  const startSheetDrag = useCallback(
    (clientY: number, startTranslateY: number) => {
      cancelPendingFrame();
      collapsedTranslateYRef.current = getCollapsedTranslateY();
      isSheetDraggingRef.current = true;
      didDragRef.current = false;
      dragStartYRef.current = clientY;
      dragStartTranslateYRef.current = startTranslateY;
      currentTranslateYRef.current = startTranslateY;

      if (sheetRef.current) {
        sheetRef.current.style.transition = "none";
      }
    },
    [cancelPendingFrame, getCollapsedTranslateY],
  );

  /** 드래그 위치를 허용 범위 안에서 다음 프레임에 반영합니다. */
  const moveSheet = useCallback(
    (clientY: number) => {
      if (!isSheetDraggingRef.current) {
        return;
      }

      const deltaY = clientY - dragStartYRef.current;

      if (Math.abs(deltaY) > DRAG_START_THRESHOLD) {
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

  /** 드래그 종료 위치를 기준으로 펼침/접힘 상태를 결정합니다. */
  const finishSheetDrag = useCallback(
    (clientY: number) => {
      if (!isSheetDraggingRef.current) {
        return;
      }

      isSheetDraggingRef.current = false;
      cancelPendingFrame();

      if (!didDragRef.current) {
        return;
      }

      const deltaY = clientY - dragStartYRef.current;
      const collapsedTranslateY = collapsedTranslateYRef.current;
      const nextState = getNextSheetState({
        deltaY,
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

  /** 취소된 드래그를 외부 상태가 가리키는 위치로 되돌립니다. */
  const cancelSheetDrag = useCallback(() => {
    isSheetDraggingRef.current = false;
    didDragRef.current = false;
    cancelPendingFrame();
    applyTranslateY(isExpanded ? 0 : collapsedTranslateYRef.current, true);
  }, [applyTranslateY, cancelPendingFrame, isExpanded]);

  const { listRef, handleListClickCapture } = useMapShopListTouchGesture({
    isExpanded,
    getCollapsedTranslateY,
    startSheetDrag,
    moveSheet,
    finishSheetDrag,
    cancelSheetDrag,
  });

  useEffect(() => {
    syncSheetPosition(true);
  }, [syncSheetPosition]);

  useEffect(() => {
    const parent = sheetRef.current?.parentElement;

    if (!parent) {
      return;
    }

    let observedParentHeight = parent.clientHeight;

    const resizeObserver = new ResizeObserver((entries) => {
      const nextParentHeight = entries[0]?.contentRect.height;

      if (
        nextParentHeight === undefined ||
        nextParentHeight === observedParentHeight ||
        isSheetDraggingRef.current
      ) {
        return;
      }

      observedParentHeight = nextParentHeight;
      syncSheetPosition();
    });

    resizeObserver.observe(parent);

    return () => resizeObserver.disconnect();
  }, [syncSheetPosition]);

  useEffect(
    () => () => {
      cancelPendingFrame();
    },
    [cancelPendingFrame],
  );

  /** 핸들을 누르면 접힘과 펼침 상태를 전환합니다. */
  const toggleSheet = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    onStateChange(isExpanded ? "collapsed" : "expanded");
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const collapsedTranslateY = getCollapsedTranslateY();

    startSheetDrag(event.clientY, isExpanded ? 0 : collapsedTranslateY);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    moveSheet(event.clientY);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishSheetDrag(event.clientY);
  };

  const handlePointerCancel = () => {
    cancelSheetDrag();
  };

  return {
    sheetRef,
    listRef,
    initialTransform,
    toggleSheet,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleListClickCapture,
  };
}
