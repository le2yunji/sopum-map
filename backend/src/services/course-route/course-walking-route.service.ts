import { Types } from "mongoose";

import { createApiError, type CourseWalkingRouteData } from "@sopum-map/shared";

import CourseModel from "../../models/course.model.js";
import ShopModel from "../../models/shop.model.js";
import { assertCourseVisibleToViewer } from "../course/course-detail.mapper.js";

import { getWalkingRoute } from "./walking-route.service.js";

/** 저장된 방문 순서와 공개 범위를 검증한 뒤 코스 전체 도보 경로를 조회합니다. */
export async function getCourseWalkingRoute(
  userId: string,
  courseId: string,
): Promise<CourseWalkingRouteData> {
  const course = await CourseModel.findById(new Types.ObjectId(courseId))
    .select({ courseType: 1, userId: 1, isPublic: 1, shops: 1 })
    .lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  assertCourseVisibleToViewer(
    {
      courseType: course.courseType,
      userId: course.userId ?? null,
      isPublic: course.isPublic,
    },
    userId,
  );

  const orderedCourseShops = [...course.shops].sort(
    (first, second) => first.order - second.order,
  );
  const shops = await ShopModel.find({
    _id: { $in: orderedCourseShops.map(({ shopId }) => shopId) },
  })
    .select({ _id: 1, name: 1, location: 1 })
    .lean();
  const shopById = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  const stops = orderedCourseShops.map(({ shopId }) => {
    const shop = shopById.get(shopId.toString());
    const coordinates = shop?.location?.coordinates;
    if (
      !shop ||
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
      name: shop.name,
      longitude: coordinates[0],
      latitude: coordinates[1],
    };
  });

  return getWalkingRoute({ stops });
}
