export const COURSE_TYPES = ["user_created", "recommended"] as const;
export type CourseType = (typeof COURSE_TYPES)[number];

export const MIN_COURSE_SHOPS = 2;
export const MAX_COURSE_SHOPS = 6;
