import { COLLAPSED_HEIGHT, DRAG_THRESHOLD } from "./mapShopListSheet.constants";
import { MapShopListSheetState } from "./mapShopListSheet.types";

/** 첫 렌더에서 사용할 시트의 시작 위치를 계산합니다. */
export function getInitialTransform(
  visible: boolean,
  state: MapShopListSheetState,
) {
  if (!visible) {
    return "translate3d(0, 100%, 0)";
  }

  if (state === "expanded") {
    return "translate3d(0, 0, 0)";
  }

  return `translate3d(0, calc(100% - ${COLLAPSED_HEIGHT}px), 0)`;
}

type GetNextSheetStateOptions = Readonly<{
  deltaY: number;
  currentTranslateY: number;
  collapsedTranslateY: number;
}>;

/** 드래그 거리와 현재 위치를 기준으로 다음 시트 상태를 결정합니다. */
export function getNextSheetState({
  deltaY,
  currentTranslateY,
  collapsedTranslateY,
}: GetNextSheetStateOptions): MapShopListSheetState {
  if (Math.abs(deltaY) >= DRAG_THRESHOLD) {
    return deltaY < 0 ? "expanded" : "collapsed";
  }

  return currentTranslateY <= collapsedTranslateY / 2
    ? "expanded"
    : "collapsed";
}
