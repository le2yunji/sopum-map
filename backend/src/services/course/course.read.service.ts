import { Types } from "mongoose";

import {
  createApiError,
  type CourseDetailData,
} from "@sopum-map/shared";
import CourseModel from "../../models/course.model.js";
import CourseLikeModel from "../../models/course-like.model.js";
import CourseShopVisitModel from "../../models/course-shop-visit.model.js";
import ShopModel from "../../models/shop.model.js";
import UserModel from "../../models/user.model.js";
import { getMainShopImageUrl } from "../../utils/shop-image.js";
import {
  getCourseShopCoordinates,
  isCourseShopUnavailable,
} from "./course.helper.js";
import {
  assertCourseVisibleToViewer,
  createCourseViewerData,
} from "./course-detail.mapper.js";

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

  assertCourseVisibleToViewer(
    {
      courseType: course.courseType,
      userId: course.userId ?? null,
      isPublic: course.isPublic,
    },
    userId,
  );

  const [author, likeCount, currentUserLike] = await Promise.all([
    course.userId
      ? UserModel.findById(course.userId)
          .select({ _id: 1, nickname: 1, profileImage: 1 })
          .lean()
      : Promise.resolve(null),
    CourseLikeModel.countDocuments({ courseId: objectCourseId }),
    CourseLikeModel.exists({
      courseId: objectCourseId,
      userId: objectUserId,
    }),
  ]);

  const viewerData = createCourseViewerData({
    course: {
      courseType: course.courseType,
      userId: course.userId ?? null,
      isPublic: course.isPublic,
    },
    viewerId: userId,
    author,
    likeCount,
    isLiked: currentUserLike !== null,
  });

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
  const [shops, courseShopVisits] = await Promise.all([
    ShopModel.find({
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
      .lean(),
    CourseShopVisitModel.find({
      userId: objectUserId,
      courseId: objectCourseId,
      shopId: { $in: shopIds },
    })
      .select({ shopId: 1 })
      .lean(),
  ]);

  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));
  const visitedShopIds = new Set(
    courseShopVisits.map((visit) => visit.shopId.toString()),
  );

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

    const { latitude, longitude } = getCourseShopCoordinates(shop);

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

      isVisited: visitedShopIds.has(shop._id.toString()),

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

    isPublic: course.courseType === "recommended" ? true : course.isPublic,

    ...viewerData,

    shops: detailShops,

    createdAt: course.createdAt.toISOString(),

    updatedAt: course.updatedAt.toISOString(),
  };
}
