import type { ApiSuccessResponse } from "../api/api.types";
import type { ShopRegionGroup } from "../shop/shop.types";
import { CourseDetailData } from "./course.types";

/**
 * 코스 생성/수정 요청에서 사용하는 상점 입력값
 */
export type CreateCourseShopInput = Readonly<{
  shopId: string;
  order: number;
  memo?: string | null;
}>;

/**
 * POST /api/courses 요청 데이터
 */
export type CreateCourseRequest = Readonly<{
  sourceFolderId: string;

  title: string;
  description?: string | null;

  shops: readonly CreateCourseShopInput[];
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
  shops?: readonly CreateCourseShopInput[];
}>;
/**
 * PATCH /api/courses/:courseId 성공 응답 데이터
 */
export type UpdateCourseData = Readonly<{
  courseId: string;
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

/**
 * GET /api/me/courses 성공 응답 데이터
 */
export type CourseListData = Readonly<{
  items: readonly CourseListItem[];
}>;

/**
 * GET /api/me/courses 성공 응답
 */
export type GetMyCoursesResponse = ApiSuccessResponse<CourseListData>;

/**
 * GET /api/courses/:courseId 성공 응답
 */
export type GetCourseDetailResponse = ApiSuccessResponse<CourseDetailData>;
