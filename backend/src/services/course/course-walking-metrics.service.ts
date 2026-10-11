import type { Types } from "mongoose";

import {
  getWalkingRouteMatrix,
  type WalkingRouteMatrix,
} from "../course-route/walking-distance-matrix.service.js";

type CourseShopId = string | Types.ObjectId;

type CourseShopForMetrics<TShopId extends CourseShopId> = Readonly<{
  shopId: TShopId;
  order: number;
  memo: string | null;
}>;

type ShopLocation = Readonly<{
  _id: Types.ObjectId;
  location?: {
    coordinates?: unknown;
  } | null;
}>;

/** 방문 순서 행렬에서 각 상점으로 들어오는 구간의 거리와 시간을 붙입니다. */
export function addWalkingMetricsToCourseShops<TShopId extends CourseShopId>(
  orderedCourseShops: readonly CourseShopForMetrics<TShopId>[],
  routeMatrix: WalkingRouteMatrix,
) {
  return orderedCourseShops.map((shop, index) => {
    if (index === 0) {
      return {
        ...shop,
        walkingDistanceFromPreviousMeters: null,
        walkingDurationFromPreviousSeconds: null,
      };
    }

    const metric = routeMatrix[index - 1]?.[index];

    if (
      !metric ||
      !Number.isFinite(metric.distanceMeters) ||
      !Number.isFinite(metric.durationSeconds)
    ) {
      throw new Error("코스 상점 사이의 도보 정보를 계산할 수 없습니다.");
    }

    return {
      ...shop,
      walkingDistanceFromPreviousMeters: metric.distanceMeters,
      walkingDurationFromPreviousSeconds: metric.durationSeconds,
    };
  });
}

/** 최종 방문 순서의 좌표로 TMAP 행렬을 조회해 저장할 상점 데이터를 만듭니다. */
export async function createCourseShopsWithWalkingMetrics<
  TShopId extends CourseShopId,
>(
  orderedCourseShops: readonly CourseShopForMetrics<TShopId>[],
  shops: readonly ShopLocation[],
) {
  const shopById = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  const routePoints = orderedCourseShops.map((courseShop) => {
    const shop = shopById.get(courseShop.shopId.toString());
    const coordinates = shop?.location?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1])
    ) {
      throw new Error("코스 상점의 위치 정보를 찾을 수 없습니다.");
    }

    return {
      shopId: courseShop.shopId.toString(),
      longitude: coordinates[0] as number,
      latitude: coordinates[1] as number,
    };
  });

  const routeMatrix = await getWalkingRouteMatrix(routePoints);

  return addWalkingMetricsToCourseShops(orderedCourseShops, routeMatrix);
}
