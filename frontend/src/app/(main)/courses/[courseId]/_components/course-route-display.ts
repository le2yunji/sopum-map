type CoursePathShop = Readonly<{
  order: number;
  latitude: number;
  longitude: number;
}>;

export type CoursePathCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

/** 상점 좌표를 방문 순서대로 정렬해 지도 미리보기용 직선 경로를 만듭니다. */
export function getStraightCoursePath(
  shops: readonly CoursePathShop[],
): CoursePathCoordinate[] {
  return [...shops]
    .sort((first, second) => first.order - second.order)
    .map(({ latitude, longitude }) => ({ latitude, longitude }));
}
