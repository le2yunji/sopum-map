import { DRAG_THRESHOLD } from "./courseVisitOrderSheet.constants";
import type { CourseVisitOrderSheetState } from "./courseVisitOrderSheet.types";

type GetNextCourseVisitOrderSheetStateOptions = Readonly<{
  deltaY: number;
  currentTranslateY: number;
  collapsedTranslateY: number;
}>;

/** 드래그 거리와 현재 위치를 기준으로 시트가 붙을 상태를 결정합니다. */
export function getNextCourseVisitOrderSheetState({
  deltaY,
  currentTranslateY,
  collapsedTranslateY,
}: GetNextCourseVisitOrderSheetStateOptions): CourseVisitOrderSheetState {
  if (Math.abs(deltaY) >= DRAG_THRESHOLD) {
    return deltaY < 0 ? "expanded" : "collapsed";
  }

  return currentTranslateY <= collapsedTranslateY / 2
    ? "expanded"
    : "collapsed";
}
