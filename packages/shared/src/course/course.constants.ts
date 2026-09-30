export const COURSE_TYPES = ["user_created", "recommended"] as const;
export type CourseType = (typeof COURSE_TYPES)[number];
