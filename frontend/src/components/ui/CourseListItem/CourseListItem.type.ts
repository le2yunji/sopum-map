import type { PublicCourseListItem } from "@sopum-map/shared";

export type CourseListItemProps = Readonly<{
  course: PublicCourseListItem;
  imageLoading?: "eager" | "lazy";
}>;
