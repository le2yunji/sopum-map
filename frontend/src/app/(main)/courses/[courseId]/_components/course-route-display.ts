import type { CourseWalkingRouteSegment } from "@sopum-map/shared";

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

type CourseRouteStop = Readonly<{
  id: string;
  order: number;
}>;

/** 방문 순서상 서로 이웃한 상점을 잇는 도보 구간만 순서대로 고릅니다. */
export function getOrderedWalkingRouteSegments(
  shops: readonly CourseRouteStop[],
  segments: readonly CourseWalkingRouteSegment[],
): CourseWalkingRouteSegment[] {
  const orderedShops = [...shops].sort(
    (first, second) => first.order - second.order,
  );

  return orderedShops.slice(1).flatMap((shop, index) => {
    const previousShop = orderedShops[index];
    const segment = segments.find(
      (candidate) =>
        candidate.fromShopId === previousShop.id &&
        candidate.toShopId === shop.id,
    );

    return segment ? [segment] : [];
  });
}
