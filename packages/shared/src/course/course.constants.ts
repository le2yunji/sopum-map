export const COURSE_TYPES = ["user_created", "recommended"] as const;
export type CourseType = (typeof COURSE_TYPES)[number];

export const PUBLIC_COURSE_SORTS = ["latest", "popular"] as const;
export type PublicCourseSort = (typeof PUBLIC_COURSE_SORTS)[number];

export const MIN_COURSE_SHOPS = 2;
export const MAX_COURSE_SHOPS = 6;

/** 요청 생략 시 사용하는 기본값 */
export const DEFAULT_COURSE_LIST_LIMIT = 20;

/** 사용자가 요청할 수 있는 최대값 */
export const MAX_COURSE_LIST_LIMIT = 20;
