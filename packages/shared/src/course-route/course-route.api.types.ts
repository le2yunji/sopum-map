import type { ShopRegionGroup } from "../shop/shop.types";

export type OptimizeCourseRouteRequest = Readonly<{
  sourceFolderId: string;
  regionGroup: ShopRegionGroup;
  shopIds: readonly string[];
  startShopId?: string;
}>;

export type OptimizeCourseRouteData = Readonly<{
  shopIds: readonly string[];
  totalDistanceMeters: number;
}>;

export type CourseRouteCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

/** 코스 전체를 한 번에 조회한 실제 도보 경로입니다. */
export type CourseWalkingRouteData = Readonly<{
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  coordinates: readonly CourseRouteCoordinate[];
}>;
