/** 코스 지도에서 허용할 직접 조작과 화면 컨트롤 정책을 반환합니다. */
export function getCourseMapInteractionOptions() {
  return {
    draggable: true,
    scrollWheel: true,
    pinchZoom: true,
    keyboardShortcuts: true,
    disableDoubleClickZoom: false,
    zoomControl: false,
  } as const;
}
