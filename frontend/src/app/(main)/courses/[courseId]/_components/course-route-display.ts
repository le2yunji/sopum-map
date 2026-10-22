export type CoursePathCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

type WalkingSegmentSummary = Readonly<{
  distanceMeters: number;
  durationSeconds: number;
}>;

/** 도보 구간을 사용자가 빠르게 읽을 수 있는 거리와 시간으로 표시합니다. */
export function formatWalkingSegment({
  distanceMeters,
  durationSeconds,
}: WalkingSegmentSummary): string {
  const durationMinutes = Math.ceil(durationSeconds / 60);
  const distance =
    distanceMeters < 1000
      ? `${Math.round(distanceMeters)}m`
      : `${(distanceMeters / 1000).toFixed(1)}km`;

  return `도보 ${durationMinutes}분 · ${distance}`;
}

/** 외부 경로에서 유효한 WGS84 좌표만 지도용 경로로 전달합니다. */
export function getWalkingCoursePath(
  coordinates: readonly CoursePathCoordinate[],
): CoursePathCoordinate[] {
  return coordinates.filter(
    ({ latitude, longitude }) =>
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180,
  );
}

/** 코스 구성이 바뀔 때만 최초 화면 맞춤을 다시 실행할 키를 만듭니다. */
export function getCourseRouteKey(
  shops: readonly Readonly<{ id: string; order: number }>[],
): string {
  return [...shops]
    .sort((first, second) => first.order - second.order)
    .map(({ id, order }) => `${order}:${id}`)
    .join("|");
}
