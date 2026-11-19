/** 지도 위의 한 지점을 나타내는 위도·경도입니다. */
export type MapCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

/** 지도를 이동할 중심 좌표와 확대 수준입니다. */
export type MapViewport = Readonly<{
  center: MapCoordinate;
  zoom: number;
}>;

/**
 * 같은 지역을 연속으로 선택해도 매번 이동할 수 있도록
 * 요청 번호를 포함한 지도 이동 명령입니다.
 */
export type MapViewportCommand = Readonly<{
  requestId: number;
  target: MapViewport;
}>;

/** 브라우저에서 확인한 현재 위치와 오차 범위입니다. */
export type MapUserLocation = MapCoordinate &
  Readonly<{
    accuracyMeters: number;
  }>;
