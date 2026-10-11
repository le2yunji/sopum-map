import { Types } from "mongoose";

import {
  createApiError,
  type ShopRegionGroup,
  type UpdateCourseData,
  type UpdateCourseRequest,
} from "@sopum-map/shared";

import ShopLikeModel from "../../models/shop-like.model.js";
import CourseModel from "../../models/course.model.js";

import ShopModel from "../../models/shop.model.js";

import { validateCourseShops, validateNewCourseShop } from "./course.helper.js";
import { createCourseShopsWithWalkingMetrics } from "./course-walking-metrics.service.js";

/**
 * 사용자 코스 수정
 */
export async function updateCourse(
  userId: string,
  courseId: string,
  input: UpdateCourseRequest,
): Promise<UpdateCourseData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  /**
   * 코스 존재 여부를 먼저 확인합니다.
   *
   * 존재 여부와 소유권을 분리해야
   * 다른 사용자의 코스에 403을 반환할 수 있습니다.
   */
  const course = await CourseModel.findById(objectCourseId)
    .select({
      _id: 1,
      userId: 1,
      courseType: 1,
      regionGroup: 1,
      shops: 1,
    })
    .lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  /**
   * 사용자 생성 코스의 작성자만 수정할 수 있습니다.
   */
  if (
    course.courseType !== "user_created" ||
    !course.userId ||
    course.userId.toString() !== objectUserId.toString()
  ) {
    throw createApiError({
      status: 403,
      code: "COURSE_FORBIDDEN",
      message: "해당 코스를 수정할 권한이 없습니다.",
    });
  }

  const update: {
    title?: string;
    description?: string | null;
    shops?: Array<{
      shopId: Types.ObjectId;
      order: number;
      memo: string | null;
      walkingDistanceFromPreviousMeters: number | null;
      walkingDurationFromPreviousSeconds: number | null;
    }>;
  } = {};

  if (input.title !== undefined) {
    update.title = input.title;
  }

  if (input.description !== undefined) {
    update.description = input.description;
  }

  /**
   * 상점 구성이 변경되는 경우에만
   * 상점 관련 비즈니스 규칙을 검증합니다.
   */
  if (input.shops !== undefined) {
    validateCourseShops(input.shops);

    const orderedCourseShops = [...input.shops].sort(
      (first, second) => first.order - second.order,
    );

    const objectShopIds = orderedCourseShops.map(
      (shop) => new Types.ObjectId(shop.shopId),
    );

    /**
     * 수정 요청에 포함된 모든 상점이 실제로 존재하는지 확인합니다.
     * 수정 시에는 sourceFolderId의 상점으로 제한하지 않습니다.
     */
    const shops = await ShopModel.find({
      _id: {
        $in: objectShopIds,
      },
    })
      .select({
        _id: 1,
        regionGroup: 1,
        status: 1,
        location: 1,
      })
      .lean();

    if (shops.length !== orderedCourseShops.length) {
      throw createApiError({
        status: 400,
        code: "INVALID_COURSE_SHOP",
        message: "존재하지 않는 상점이 포함되어 있습니다.",
      });
    }

    /**
     * 기존 코스에 없던 상점만 찾아냅니다.
     */
    const currentShopIds = new Set(
      course.shops.map((shop) => shop.shopId.toString()),
    );

    const addedShopIds = orderedCourseShops
      .filter((shop) => !currentShopIds.has(shop.shopId))
      .map((shop) => new Types.ObjectId(shop.shopId));

    /**
     * 새로 추가되는 상점은 현재 사용자가
     * 좋아요한 상점이어야 합니다.
     *
     * 기존 코스에 이미 들어 있던 상점은
     * 좋아요가 해제되어 있어도 유지할 수 있습니다.
     */
    if (addedShopIds.length > 0) {
      const likedShopCount = await ShopLikeModel.countDocuments({
        userId: objectUserId,

        shopId: {
          $in: addedShopIds,
        },
      });

      if (likedShopCount !== addedShopIds.length) {
        throw createApiError({
          status: 400,
          code: "COURSE_SHOP_NOT_LIKED",
          message: "새로 추가하는 상점은 현재 좋아요한 상점이어야 합니다.",
        });
      }
    }

    const addedShopIdSet = new Set(
      addedShopIds.map((shopId) => shopId.toString()),
    );

    /**
     * Course의 regionGroup은 생성 이후 변경하지 않습니다.
     *
     * 모든 상점은 기존 course.regionGroup과 같아야 합니다.
     * hidden / closed / 위치정보 제한은 새로 추가되는 상점에만 적용합니다.
     *
     * 기존 상점이 이후 비활성 상태가 되어도
     * 수정 과정에서 자동으로 제거하지 않습니다.
     */
    for (const shop of shops) {
      if (shop.regionGroup !== course.regionGroup) {
        throw createApiError({
          status: 400,
          code: "COURSE_REGION_MISMATCH",
          message: "코스에는 같은 지역의 상점만 포함할 수 있습니다.",
        });
      }

      if (addedShopIdSet.has(shop._id.toString())) {
        validateNewCourseShop(shop, course.regionGroup);
      }
    }

    update.shops = await createCourseShopsWithWalkingMetrics(
      orderedCourseShops.map((shop) => ({
        shopId: new Types.ObjectId(shop.shopId),
        order: shop.order,
        memo: shop.memo ?? null,
      })),
      shops,
    );
  }

  const updatedCourse = await CourseModel.findByIdAndUpdate(
    objectCourseId,
    {
      $set: update,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .select({
      _id: 1,
    })
    .lean();

  /**
   * 조회 이후 삭제되는 경쟁 상황까지 방어합니다.
   */
  if (!updatedCourse) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  return {
    courseId: updatedCourse._id.toString(),
  };
}
