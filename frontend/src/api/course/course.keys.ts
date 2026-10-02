export const courseKeys = {
  all: ["courses"] as const,

  details: () => [...courseKeys.all, "detail"] as const,

  detail: (courseId: string) => [...courseKeys.details(), courseId] as const,

  myCourses: () => [...courseKeys.all, "me"] as const,
};
