import type { UpdateCourseRequest } from "@sopum-map/shared";

import type { CourseEditorSubmitData } from "../../../_components/CourseEditor";

type SaveCourseEditInput = Readonly<{
  courseId: string;
  previousIsPublic: boolean;
  input: CourseEditorSubmitData;
  updateCourse: (
    courseId: string,
    input: UpdateCourseRequest,
  ) => Promise<unknown>;
  updateVisibility: (
    courseId: string,
    isPublic: boolean,
  ) => Promise<unknown>;
}>;

/** 코스 내용과 별도 API인 공개 상태를 필요한 경우에만 차례로 저장합니다. */
export async function saveCourseEdit({
  courseId,
  previousIsPublic,
  input,
  updateCourse,
  updateVisibility,
}: SaveCourseEditInput): Promise<void> {
  await updateCourse(courseId, {
    title: input.title,
    description: input.description,
    shops: input.shops,
  });

  if (input.isPublic === previousIsPublic) {
    return;
  }

  await updateVisibility(courseId, input.isPublic);
}
