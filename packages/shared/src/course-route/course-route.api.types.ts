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
