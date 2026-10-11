import { Types } from "mongoose";

import { createApiError, type CourseWalkingRouteData } from "@sopum-map/shared";

import CourseModel from "../../models/course.model.js";

import { getCourseWalkingRoute } from "./course-walking-route.service.js";

export async function getWalkingRouteByCourse(
  userId: string,
  courseId: string,
): Promise<CourseWalkingRouteData> {
  const objectUserId = new Types.ObjectId(userId);

  const objectCourseId = new Types.ObjectId(courseId);

  const course = await CourseModel.findOne({
    _id: objectCourseId,

    userId: objectUserId,
  })
    .select({
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

  const shopIds = [...course.shops]
    .sort((first, second) => first.order - second.order)
    .map((item) => item.shopId.toString());

  return getCourseWalkingRoute({
    shopIds,
  });
}
