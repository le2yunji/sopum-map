import { Types } from "mongoose";

import {
  createApiError,
  type CourseAuthor,
  type CourseType,
} from "@sopum-map/shared";

type CourseForViewer = Readonly<{
  courseType: CourseType;
  userId: Types.ObjectId | null;
  isPublic: boolean;
}>;

type CourseAuthorDocument = Readonly<{
  _id: Types.ObjectId;
  nickname?: string | null;
  profileImage?: string | null;
}>;

type CreateCourseViewerDataInput = Readonly<{
  course: CourseForViewer;
  viewerId: string;
  author: CourseAuthorDocument | null;
  likeCount: number;
  isLiked: boolean;
}>;

/** 현재 사용자가 코스 상세을 볼 수 있는지 공개 범위와 소유권으로 검증합니다. */
export function assertCourseVisibleToViewer(
  course: CourseForViewer,
  viewerId: string,
): void {
  const isOwner = course.userId?.toString() === viewerId;

  if (course.courseType === "user_created" && !course.isPublic && !isOwner) {
    throw createApiError({
      status: 403,
      code: "COURSE_PRIVATE",
      message: "작성자가 비공개한 코스입니다.",
    });
  }
}

/** 코스 종류와 조회자를 기준으로 작성자·소유권·좋아요 표시 데이터를 만듭니다. */
export function createCourseViewerData({
  course,
  viewerId,
  author,
  likeCount,
  isLiked,
}: CreateCourseViewerDataInput): Readonly<{
  author: CourseAuthor;
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;
}> {
  assertCourseVisibleToViewer(course, viewerId);

  if (course.courseType === "recommended") {
    return {
      author: {
        id: null,
        displayName: "소품지도",
        profileImageUrl: null,
        isService: true,
      },
      isOwner: false,
      likeCount,
      isLiked,
    };
  }

  const isOwner = course.userId?.toString() === viewerId;
  const userAuthor: CourseAuthor = {
    id: course.userId?.toString() ?? null,
    displayName: author?.nickname ?? "알 수 없는 사용자",
    profileImageUrl: author?.profileImage ?? null,
    isService: false,
  };

  return {
    author: userAuthor,
    isOwner,
    likeCount,
    isLiked: isOwner ? false : isLiked,
  };
}
