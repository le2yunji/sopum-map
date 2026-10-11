import { Types } from "mongoose";

import { createApiError, type CourseWalkingRouteData } from "@sopum-map/shared";

import ShopModel from "../../models/shop.model.js";

import { getWalkingRoute } from "./walking-route.service.js";

type GetCourseWalkingRouteParams = Readonly<{
  shopIds: readonly string[];
}>;

/**
 * 저장된 상점 순서대로
 * 실제 보행 경로를 조회합니다.
 */
export async function getCourseWalkingRoute({
  shopIds,
}: GetCourseWalkingRouteParams): Promise<CourseWalkingRouteData> {
  if (shopIds.length < 2) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_ROUTE_SHOPS",
      message: "도보 경로에는 상점이 2개 이상 필요합니다.",
    });
  }

  const objectShopIds = shopIds.map((shopId) => new Types.ObjectId(shopId));

  const shops = await ShopModel.find({
    _id: {
      $in: objectShopIds,
    },
  })
    .select({
      _id: 1,
      name: 1,
      location: 1,
    })
    .lean();

  if (shops.length !== shopIds.length) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "코스에 포함된 상점을 찾을 수 없습니다.",
    });
  }

  const shopById = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  const orderedShops = shopIds.map((shopId) => {
    const shop = shopById.get(shopId);

    if (!shop) {
      throw createApiError({
        status: 404,
        code: "SHOP_NOT_FOUND",
        message: "코스에 포함된 상점을 찾을 수 없습니다.",
      });
    }

    const coordinates = shop.location?.coordinates;

    if (
      !coordinates ||
      coordinates.length < 2 ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1])
    ) {
      throw createApiError({
        status: 400,
        code: "INVALID_SHOP_LOCATION",
        message: "위치 정보가 없는 상점이 포함되어 있습니다.",
      });
    }

    return {
      id: shopId,
      name: shop.name,

      longitude: coordinates[0],

      latitude: coordinates[1],
    };
  });

  const segments: CourseWalkingRouteData["segments"][number][] = [];

  /**
   * A→B, B→C, C→D 순으로 조회합니다.
   *
   * 순서를 보존하기 위해 Promise.all보다는
   * 명시적인 순차 결과 조립을 사용합니다.
   */
  for (let index = 0; index < orderedShops.length - 1; index += 1) {
    const start = orderedShops[index];

    const end = orderedShops[index + 1];

    const route = await getWalkingRoute({
      start: {
        latitude: start.latitude,
        longitude: start.longitude,
      },

      end: {
        latitude: end.latitude,
        longitude: end.longitude,
      },

      startName: start.name,

      endName: end.name,
    });

    segments.push({
      fromShopId: start.id,

      toShopId: end.id,

      distanceMeters: route.distanceMeters,

      durationSeconds: route.durationSeconds,

      coordinates: route.coordinates,
    });
  }

  return {
    totalDistanceMeters: segments.reduce(
      (total, segment) => total + segment.distanceMeters,
      0,
    ),

    totalDurationSeconds: segments.reduce(
      (total, segment) => total + segment.durationSeconds,
      0,
    ),

    segments,
  };
}
