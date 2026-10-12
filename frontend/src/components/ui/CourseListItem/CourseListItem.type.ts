export type CourseListItemProps = {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  imageLoading?: "eager" | "lazy";
  tags: string[];
};
