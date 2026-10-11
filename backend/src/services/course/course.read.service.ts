import { Types } from "mongoose";

import {
  createApiError,
  type CourseDetailData,
  type CourseListData,
} from "@sopum-map/shared";
import CourseModel from "../../models/course.model.js";
import ShopModel from "../../models/shop.model.js";
import { getMainShopImageUrl } from "../../utils/shop-image.js";
import { isCourseShopUnavailable } from "./course.helper.js";

/**
 * 코스 상세 정보를 조회
 */
export async function getCourseDetail(
  userId: string,
  courseId: string,
): Promise<CourseDetailData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  /**
   * 코스를 먼저 조회
   */
  const course = await CourseModel.findById(objectCourseId).lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  /**
   * 비공개 코스는 작성자만 조회할 수 있음
   *
   * 현재 1차 구현의 사용자 코스는 모두 비공개지만,
   * 추후 공개 기능을 고려해 isPublic 기준으로 검사
   */
  if (!course.isPublic) {
    const isOwner = course.userId?.toString() === objectUserId.toString();

    if (!isOwner) {
      throw createApiError({
        status: 403,
        code: "COURSE_FORBIDDEN",
        message: "해당 코스에 접근할 수 없습니다.",
      });
    }
  }

  /**
   * Course 자체에 저장된 방문 순서를 기준으로
   * 상점 ID를 정렬
   */
  const orderedCourseShops = [...course.shops].sort(
    (a, b) => a.order - b.order,
  );

  const shopIds = orderedCourseShops.map((courseShop) => courseShop.shopId);

  /**
   * 상점의 현재 정보를 조회합니다.
   *
   * status 조건을 걸지 않습니다.
   * hidden / temporarily_closed / closed 상태도
   * 코스에서는 계속 조회되어야 합니다.
   */
  const shops = await ShopModel.find({
    _id: {
      $in: shopIds,
    },
  })
    .select({
      _id: 1,

      name: 1,
      address: 1,

      images: 1,

      regionGroup: 1,
      location: 1,

      status: 1,
    })
    .lean();

  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  /**
   * Course에 포함된 Shop 문서가 물리적으로 삭제된 경우
   * 현재 모델만으로는 이름/주소 등을 복구할 수 없습니다.
   *
   * 폐점은 Shop 삭제가 아니라 status=closed로
   * 관리하는 것을 전제로 합니다.
   */
  if (shops.length !== orderedCourseShops.length) {
    throw createApiError({
      status: 500,
      code: "COURSE_SHOP_DATA_MISSING",
      message: "코스에 포함된 일부 상점 정보를 찾을 수 없습니다.",
    });
  }

  const detailShops = orderedCourseShops.map((courseShop) => {
    const shop = shopMap.get(courseShop.shopId.toString());

    if (!shop) {
      throw createApiError({
        status: 500,
        code: "COURSE_SHOP_DATA_MISSING",
        message: "코스에 포함된 일부 상점 정보를 찾을 수 없습니다.",
      });
    }

    const [longitude, latitude] = shop.location.coordinates;

    return {
      id: shop._id.toString(),

      name: shop.name,
      address: shop.address,

      mainImageUrl: getMainShopImageUrl(shop.images ?? []),

      regionGroup: shop.regionGroup,

      latitude,
      longitude,

      status: shop.status,

      isUnavailable: isCourseShopUnavailable(shop.status),

      order: courseShop.order,

      memo: courseShop.memo ?? null,

      walkingDistanceFromPreviousMeters:
        courseShop.walkingDistanceFromPreviousMeters ?? null,

      walkingDurationFromPreviousSeconds:
        courseShop.walkingDurationFromPreviousSeconds ?? null,
    };
  });

  return {
    id: course._id.toString(),

    courseType: course.courseType,

    sourceFolderId: course.sourceFolderId?.toString() ?? null,

    title: course.title,

    description: course.description ?? null,

    regionGroup: course.regionGroup,

    isPublic: course.isPublic,

    shops: detailShops,

    createdAt: course.createdAt.toISOString(),

    updatedAt: course.updatedAt.toISOString(),
  };
}

/**
 * 내가 만든 사용자 코스 목록을 조회합니다.
 */
export async function getMyCourses(userId: string): Promise<CourseListData> {
  const objectUserId = new Types.ObjectId(userId);

  const courses = await CourseModel.find({
    userId: objectUserId,
    courseType: "user_created",
  })
    .sort({
      createdAt: -1,
    })
    .select({
      _id: 1,

      sourceFolderId: 1,

      title: 1,
      description: 1,

      regionGroup: 1,

      shops: 1,

      createdAt: 1,
      updatedAt: 1,
    })
    .lean();

  if (courses.length === 0) {
    return {
      items: [],
    };
  }

  /**
   * 각 코스의 첫 번째 방문 상점을 대표 이미지 후보로 사용합니다.
   */
  const firstShopIds = courses
    .map((course) => {
      const firstCourseShop = [...course.shops].sort(
        (a, b) => a.order - b.order,
      )[0];

      return firstCourseShop?.shopId ?? null;
    })
    .filter(
      (shopId): shopId is Types.ObjectId => shopId instanceof Types.ObjectId,
    );

  const shops =
    firstShopIds.length > 0
      ? await ShopModel.find({
          _id: {
            $in: firstShopIds,
          },
        })
          .select({
            _id: 1,
            images: 1,
          })
          .lean()
      : [];

  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  return {
    items: courses.map((course) => {
      const orderedShops = [...course.shops].sort((a, b) => a.order - b.order);

      const firstShop = orderedShops[0];

      const shop = firstShop
        ? shopMap.get(firstShop.shopId.toString())
        : undefined;

      return {
        id: course._id.toString(),

        title: course.title,

        description: course.description ?? null,

        regionGroup: course.regionGroup,

        sourceFolderId: course.sourceFolderId?.toString() ?? null,

        shopCount: course.shops.length,

        mainImageUrl: shop ? getMainShopImageUrl(shop.images ?? []) : null,

        createdAt: course.createdAt.toISOString(),

        updatedAt: course.updatedAt.toISOString(),
      };
    }),
  };
}
