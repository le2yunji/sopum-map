import {
  isApiError,
  type PickFolderCourseRegion,
} from "@sopum-map/shared";

/** 선택 가능한 지역이 하나일 때 바로 이동할 코스 경로를 반환합니다. */
export function getCourseRegionDestination(
  folderId: string,
  regions: readonly PickFolderCourseRegion[],
): string | null {
  const selectableRegions = regions.filter(
    (region) => region.courseId !== null || region.availableShopCount >= 2,
  );

  if (selectableRegions.length !== 1) {
    return null;
  }

  const [region] = selectableRegions;

  if (region.courseId) {
    return `/courses/${region.courseId}/edit`;
  }

  return `/courses/new?folderId=${folderId}&regionGroup=${region.regionGroup}`;
}

/** 폴더 ID를 현재 순서에서 한 칸 이동합니다. */
export function moveFolderId(
  folderIds: readonly string[],
  folderId: string,
  direction: -1 | 1,
): string[] {
  const currentIndex = folderIds.indexOf(folderId);
  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= folderIds.length) {
    return [...folderIds];
  }

  const nextFolderIds = [...folderIds];
  [nextFolderIds[currentIndex], nextFolderIds[nextIndex]] = [
    nextFolderIds[nextIndex],
    nextFolderIds[currentIndex],
  ];

  return nextFolderIds;
}

/** 내 픽 API의 예상 가능한 상태 코드를 사용자 안내로 변환합니다. */
export function getPickFolderErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "요청을 처리하지 못했습니다. 다시 시도해주세요.";
  }

  if (error.status === 401) {
    return "로그인이 만료되었습니다. 다시 로그인해주세요.";
  }

  if (error.status === 403) {
    return "이 폴더를 변경할 권한이 없습니다.";
  }

  if (error.status === 404) {
    return "폴더 또는 상점을 찾을 수 없습니다.";
  }

  if (error.status === 409) {
    return error.code === "SHOP_NOT_LIKED"
      ? "좋아요한 상점만 폴더에 추가할 수 있습니다."
      : "현재 상태에서는 요청을 처리할 수 없습니다.";
  }

  return error.message || "요청을 처리하지 못했습니다. 다시 시도해주세요.";
}
