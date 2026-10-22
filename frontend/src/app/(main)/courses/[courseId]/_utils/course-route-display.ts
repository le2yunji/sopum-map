type CoursePathShop = Readonly<{
  order: number;
  latitude: number | null;
  longitude: number | null;
}>;

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

/** 상점 좌표를 방문 순서대로 정렬해 지도 미리보기용 직선 경로를 만듭니다. */
export function getStraightCoursePath(
  shops: readonly CoursePathShop[],
): CoursePathCoordinate[] {
  return [...shops]
    .sort((first, second) => first.order - second.order)
    .filter(
      (shop): shop is CoursePathShop & {
        latitude: number;
        longitude: number;
      } => shop.latitude !== null && shop.longitude !== null,
    )
    .map(({ latitude, longitude }) => ({ latitude, longitude }));
}
