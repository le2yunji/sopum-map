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

/** 연결선에 나눠 표시할 도보 시간과 거리 문구를 만듭니다. */
export function formatWalkingSegmentParts({
  distanceMeters,
  durationSeconds,
}: WalkingSegmentSummary): Readonly<{
  durationLabel: string;
  distanceLabel: string;
}> {
  const durationMinutes = Math.ceil(durationSeconds / 60);
  const distance =
    distanceMeters < 1000
      ? `${Math.round(distanceMeters)}m`
      : `${(distanceMeters / 1000).toFixed(1)}km`;

  return {
    durationLabel: `도보 ${durationMinutes}분`,
    distanceLabel: distance,
  };
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
