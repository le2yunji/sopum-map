import type { MapBounds } from "@/components/naver-map";

const MAP_BOUNDS_PRECISION = 5;

/** 좌표를 지도 영역 비교에 사용할 정밀도로 맞춥니다. */
function normalizeCoordinate(coordinate: number): number {
  return Number(coordinate.toFixed(MAP_BOUNDS_PRECISION));
}

/** 지도 경계의 모든 좌표를 같은 정밀도로 맞춥니다. */
export function normalizeMapBounds(bounds: MapBounds): MapBounds {
  return {
    southWestLat: normalizeCoordinate(bounds.southWestLat),
    southWestLng: normalizeCoordinate(bounds.southWestLng),
    northEastLat: normalizeCoordinate(bounds.northEastLat),
    northEastLng: normalizeCoordinate(bounds.northEastLng),
  };
}

/** 두 지도 경계가 같은 검색 영역인지 확인합니다. */
export function areMapBoundsEqual(
  left: MapBounds | undefined,
  right: MapBounds | undefined,
): boolean {
  if (!left || !right) {
    return left === right;
  }

  const normalizedLeft = normalizeMapBounds(left);
  const normalizedRight = normalizeMapBounds(right);

  return (
    normalizedLeft.southWestLat === normalizedRight.southWestLat &&
    normalizedLeft.southWestLng === normalizedRight.southWestLng &&
    normalizedLeft.northEastLat === normalizedRight.northEastLat &&
    normalizedLeft.northEastLng === normalizedRight.northEastLng
  );
}
