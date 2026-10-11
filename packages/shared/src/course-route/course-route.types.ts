// course-route.types.ts

export type CourseRouteCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

export type CourseWalkingRouteSegment = Readonly<{
  fromShopId: string;
  toShopId: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: readonly CourseRouteCoordinate[];
}>;
