import type { ShopRegionGroup } from "../shop/shop.types";
import { CourseWalkingRouteSegment } from "./course-route.types";

export type OptimizeCourseRouteRequest = Readonly<{
  sourceFolderId: string;
  regionGroup: ShopRegionGroup;
  shopIds: readonly string[];
}>;

export type OptimizeCourseRouteData = Readonly<{
  shopIds: readonly string[];
  totalDistanceMeters: number;
}>;

export type CourseWalkingRouteData = Readonly<{
  totalDistanceMeters: number;
  totalDurationSeconds: number;

  segments: readonly CourseWalkingRouteSegment[];
}>;
