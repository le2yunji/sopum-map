const SWIPE_THRESHOLD_PX = 48;

/** 첫 페이지를 벗어나지 않는 이전 위치를 반환합니다. */
export function getPreviousSlide(index: number): number {
  return Math.max(0, index - 1);
}

/** 마지막 페이지를 벗어나지 않는 다음 위치를 반환합니다. */
export function getNextSlide(index: number, slideCount: number): number {
  return Math.min(slideCount - 1, index + 1);
}

/** 충분히 긴 가로 동작만 페이지 이동으로 해석합니다. */
export function getSwipeDirection(
  startX: number,
  endX: number,
): "previous" | "next" | null {
  const distance = endX - startX;

  if (Math.abs(distance) < SWIPE_THRESHOLD_PX) {
    return null;
  }

  return distance > 0 ? "previous" : "next";
}
