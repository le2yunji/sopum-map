/** 선택 상태를 크기 차이로 구분하는 네이버 지도 마커 아이콘을 만듭니다. */
export function getMapMarkerIcon(isSelected: boolean): naver.maps.HtmlIcon {
  const size = isSelected ? 38 : 32;
  const anchor = size / 2;

  return {
    content: `<span aria-hidden="true" style="display:grid;place-items:center;width:${size}px;height:${size}px;border:2px solid #dde5a9;border-radius:999px;background:#fff;color:#5d9c3e;font-size:18px;box-shadow:0 3px 8px rgba(0,0,0,.18)">✤</span>`,
    anchor: { x: anchor, y: anchor },
  };
}
