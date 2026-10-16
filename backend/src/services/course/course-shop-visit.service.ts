import { createApiError } from "@sopum-map/shared";
import { Types } from "mongoose";

import CourseShopVisitModel from "../../models/course-shop-visit.model.js";
import CourseModel from "../../models/course.model.js";
import { assertCourseVisibleToViewer } from "./course-detail.mapper.js";

type CourseShopVisitIds = Readonly<{
  objectUserId: Types.ObjectId;
  objectCourseId: Types.ObjectId;
  objectShopId: Types.ObjectId;
}>;

/** 방문 상태를 바꿀 수 있는 코스·상점인지 검증하고 저장용 ID를 반환합니다. */
async function resolveCourseShopVisitIds(
  userId: string,
  courseId: string,
  shopId: string,
): Promise<CourseShopVisitIds> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);
  const objectShopId = new Types.ObjectId(shopId);
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

  const hasShop = course.shops.some(
    (courseShop) => courseShop.shopId.toString() === shopId,
  );
  if (!hasShop) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_IN_COURSE",
      message: "코스에 포함되지 않은 상점입니다.",
    });
  }

  return { objectUserId, objectCourseId, objectShopId };
}

/** 코스 상점을 방문 완료 상태로 멱등하게 저장합니다. */
export async function setCourseShopVisited(
  userId: string,
  courseId: string,
  shopId: string,
): Promise<Readonly<{ isVisited: true }>> {
  const { objectUserId, objectCourseId, objectShopId } =
    await resolveCourseShopVisitIds(userId, courseId, shopId);
  const key = {
    userId: objectUserId,
    courseId: objectCourseId,
    shopId: objectShopId,
  };

  await CourseShopVisitModel.updateOne(
    key,
    { $setOnInsert: key },
    { upsert: true },
  );

  return { isVisited: true };
}

/** 코스 상점을 미방문 상태로 멱등하게 되돌립니다. */
export async function unsetCourseShopVisited(
  userId: string,
  courseId: string,
  shopId: string,
): Promise<Readonly<{ isVisited: false }>> {
  const { objectUserId, objectCourseId, objectShopId } =
    await resolveCourseShopVisitIds(userId, courseId, shopId);

  await CourseShopVisitModel.deleteOne({
    userId: objectUserId,
    courseId: objectCourseId,
    shopId: objectShopId,
  });

  return { isVisited: false };
}
