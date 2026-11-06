export type CoursePathCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

type WalkingSegmentSummary = Readonly<{
  distanceMeters: number;
  durationSeconds: number;
}>;

type CourseMapCenterShop = Readonly<{
  latitude: number | null;
  longitude: number | null;
  order: number;
}>;

const DEFAULT_COURSE_MAP_CENTER: CoursePathCoordinate = {
  latitude: 37.5445,
  longitude: 127.056,
};

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

/** 위치가 없는 빈 코스도 지도를 만들 수 있도록 안전한 중심점을 반환합니다. */
export function getCourseMapCenter(
  shops: readonly CourseMapCenterShop[],
): CoursePathCoordinate {
  const firstShop = [...shops]
    .sort((first, second) => first.order - second.order)
    .find(
      (
        shop,
      ): shop is CourseMapCenterShop & {
        latitude: number;
        longitude: number;
      } => shop.latitude !== null && shop.longitude !== null,
    );

  return firstShop
    ? { latitude: firstShop.latitude, longitude: firstShop.longitude }
    : DEFAULT_COURSE_MAP_CENTER;
}
