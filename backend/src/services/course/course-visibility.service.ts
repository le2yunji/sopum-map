import { Types } from "mongoose";

import {
  createApiError,
  type UpdateCourseVisibilityData,
} from "@sopum-map/shared";

import CourseModel from "../../models/course.model.js";

/** 사용자 생성 코스의 작성자만 공개 여부를 변경할 수 있게 합니다. */
export async function updateCourseVisibility(
  userId: string,
  courseId: string,
  isPublic: boolean,
): Promise<UpdateCourseVisibilityData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  const course = await CourseModel.findById(objectCourseId)
    .select({ userId: 1, courseType: 1 })
    .lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  if (
    course.courseType !== "user_created" ||
    !course.userId ||
    course.userId.toString() !== objectUserId.toString()
  ) {
    throw createApiError({
      status: 403,
      code: "COURSE_FORBIDDEN",
      message: "코스 공개 여부를 변경할 권한이 없습니다.",
    });
  }

  const result = await CourseModel.updateOne(
    {
      _id: objectCourseId,
      userId: objectUserId,
      courseType: "user_created",
    },
    { $set: { isPublic } },
    { runValidators: true },
  );

  if (result.matchedCount === 0) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  return { courseId, isPublic };
}
