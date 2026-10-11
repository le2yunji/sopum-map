import type { ApiSuccessResponse } from "../api/api.types";
import type { ShopRegionGroup } from "../shop/shop.types";
import type { CourseAuthor, CourseDetailData } from "./course.types";

/**
 * 코스 생성/수정 요청에서 사용하는 상점 입력값
 */
export type CourseShopInput = Readonly<{
  shopId: string;
  order: number;
  memo?: string | null;
}>;

/**
 * POST /api/courses 요청 데이터
 */
export type CreateCourseRequest = Readonly<{
  sourceFolderId: string;
  regionGroup: ShopRegionGroup;
  title: string;
  description?: string | null;

  shops: readonly CourseShopInput[];
}>;

/**
 * POST /api/courses 성공 응답 데이터
 */
export type CreateCourseData = Readonly<{
  courseId: string;
}>;

/**
 * PATCH /api/courses/:courseId 요청 데이터
 */
export type UpdateCourseRequest = Readonly<{
  title?: string;
  description?: string | null;
  shops?: readonly CourseShopInput[];
}>;
/**
 * PATCH /api/courses/:courseId 성공 응답 데이터
 */
export type UpdateCourseData = Readonly<{
  courseId: string;
}>;

/** PATCH /api/courses/:courseId/visibility 요청 데이터 */
export type UpdateCourseVisibilityRequest = Readonly<{
  isPublic: boolean;
}>;

/** 공개 여부 변경 성공 데이터 */
export type UpdateCourseVisibilityData = Readonly<{
  courseId: string;
  isPublic: boolean;
}>;

/** 좋아요 변경 성공 데이터 */
export type CourseLikeData = Readonly<{
  courseId: string;
  isLiked: boolean;
  likeCount: number;
}>;

/** 커서 기반 코스 목록 공통 응답 */
export type CourseCursorPage<T> = Readonly<{
  items: readonly T[];
  nextCursor: string | null;
  hasNext: boolean;
}>;

/**
 * 내 코스 목록의 개별 코스 항목
 */
export type CourseListItem = Readonly<{
  id: string;

  title: string;
  description: string | null;

  regionGroup: ShopRegionGroup;

  sourceFolderId: string | null;

  shopCount: number;

  mainImageUrl: string | null;

  createdAt: string;
  updatedAt: string;
}>;

/** 공개 여부와 받은 좋아요 수를 포함한 내 코스 항목 */
export type MyCourseListItem = CourseListItem &
  Readonly<{
    isPublic: boolean;
    likeCount: number;
  }>;

/** 공개 상태인 찜한 코스 항목 */
export type PublicLikedCourseListItem = Readonly<{
  id: string;
  isPrivate: false;
  title: string;
  description: string | null;
  regionGroup: ShopRegionGroup;
  shopCount: number;
  mainImageUrl: string | null;
  author: CourseAuthor;
  likeCount: number;
  likedAt: string;
}>;

/** 비공개 코스의 민감한 정보를 숨긴 찜 항목 */
export type PrivateLikedCourseListItem = Readonly<{
  id: string;
  isPrivate: true;
  likedAt: string;
}>;

export type LikedCourseListItem =
  | PublicLikedCourseListItem
  | PrivateLikedCourseListItem;

/**
 * GET /api/me/courses 성공 응답 데이터
 */
export type CourseListData = Readonly<{
  items: readonly CourseListItem[];
}>;

/** 커서 기반 내 코스 목록 데이터 */
export type MyCourseListData = CourseCursorPage<MyCourseListItem>;

/** GET /api/me/liked-courses 성공 응답 데이터 */
export type LikedCourseListData = CourseCursorPage<LikedCourseListItem>;

/**
 * GET /api/me/courses 성공 응답
 */
export type GetMyCoursesResponse = ApiSuccessResponse<CourseListData>;

export type GetMyLikedCoursesResponse =
  ApiSuccessResponse<LikedCourseListData>;

/**
 * GET /api/courses/:courseId 성공 응답
 */
export type GetCourseDetailResponse = ApiSuccessResponse<CourseDetailData>;
