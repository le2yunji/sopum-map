import { Types } from "mongoose";

import { createApiError } from "@sopum-map/shared";

import CourseModel from "../../models/course.model.js";
import CourseLikeModel from "../../models/course-like.model.js";

/**
 * 사용자 코스 삭제
 */
export async function deleteCourse(
  userId: string,
  courseId: string,
): Promise<void> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  /**
   * 존재 여부와 소유권을 구분하기 위해
   * 먼저 코스를 조회합니다.
   */
  const course = await CourseModel.findById(objectCourseId)
    .select({
      _id: 1,
      userId: 1,
      courseType: 1,
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
   * 사용자 생성 코스의 작성자만 삭제할 수 있습니다.
   */
  if (
    course.courseType !== "user_created" ||
    !course.userId ||
    course.userId.toString() !== objectUserId.toString()
  ) {
    throw createApiError({
      status: 403,
      code: "COURSE_FORBIDDEN",
      message: "해당 코스를 삭제할 권한이 없습니다.",
    });
  }

  const result = await CourseModel.deleteOne({
    _id: objectCourseId,
    userId: objectUserId,
    courseType: "user_created",
  });

  /**
   * 조회 직후 다른 요청에서 삭제된 경우까지 방어합니다.
   */
  if (result.deletedCount === 0) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  await CourseLikeModel.deleteMany({
    courseId: objectCourseId,
  });
}
