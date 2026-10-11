import { Types } from "mongoose";

import { createApiError, type CourseLikeData } from "@sopum-map/shared";

import CourseLikeModel from "../../models/course-like.model.js";
import CourseModel from "../../models/course.model.js";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";

/** 공개 코스인지와 본인 코스가 아닌지를 검증한 뒤 좋아요를 저장합니다. */
export async function likeCourse(
  userId: string,
  courseId: string,
): Promise<CourseLikeData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  const course = await CourseModel.findById(objectCourseId)
    .select({ userId: 1, courseType: 1, isPublic: 1 })
    .lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  const isOwner = course.userId?.toString() === objectUserId.toString();

  if (course.courseType === "user_created" && isOwner) {
    throw createApiError({
      status: 400,
      code: "COURSE_SELF_LIKE_NOT_ALLOWED",
      message: "내가 만든 코스는 좋아요할 수 없습니다.",
    });
  }

  if (course.courseType === "user_created" && !course.isPublic) {
    throw createApiError({
      status: 403,
      code: "COURSE_PRIVATE",
      message: "작성자가 비공개한 코스입니다.",
    });
  }

  try {
    await CourseLikeModel.updateOne(
      { userId: objectUserId, courseId: objectCourseId },
      { $setOnInsert: { userId: objectUserId, courseId: objectCourseId } },
      { upsert: true },
    );
  } catch (error) {
    if (!isMongoDuplicateKeyError(error)) {
      throw error;
    }
  }

  const likeCount = await CourseLikeModel.countDocuments({
    courseId: objectCourseId,
  });

  return { courseId, isLiked: true, likeCount };
}

/** 공개 상태와 관계없이 현재 사용자의 코스 좋아요를 제거합니다. */
export async function unlikeCourse(
  userId: string,
  courseId: string,
): Promise<CourseLikeData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  await CourseLikeModel.deleteOne({
    userId: objectUserId,
    courseId: objectCourseId,
  });

  const likeCount = await CourseLikeModel.countDocuments({
    courseId: objectCourseId,
  });

  return { courseId, isLiked: false, likeCount };
}
