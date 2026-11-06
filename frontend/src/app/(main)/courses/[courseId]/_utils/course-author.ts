import type { CourseType } from "@sopum-map/shared";

type GetCourseAuthorDisplayNameInput = Readonly<{
  authorDisplayName?: string;
  courseType: CourseType;
  isOwner: boolean;
  currentUserNickname?: string;
}>;

/** API 전환 중 작성자가 누락돼도 소유자와 추천 코스의 이름을 올바르게 표시합니다. */
export function getCourseAuthorDisplayName({
  authorDisplayName,
  courseType,
  isOwner,
  currentUserNickname,
}: GetCourseAuthorDisplayNameInput): string {
  if (authorDisplayName && authorDisplayName !== "알 수 없는 사용자") {
    return authorDisplayName;
  }

  if (isOwner && currentUserNickname) {
    return currentUserNickname;
  }

  return courseType === "recommended" ? "소품지도" : "알 수 없는 사용자";
}
