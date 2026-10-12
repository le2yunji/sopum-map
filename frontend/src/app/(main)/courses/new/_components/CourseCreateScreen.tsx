"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  SHOP_REGION_GROUP_LABELS,
  SHOP_REGION_GROUPS,
  type ShopRegionGroup,
} from "@sopum-map/shared";

import { useCreateCourse } from "@/api/course/course.query";
import {
  useInfiniteShopsByFolder,
  usePickFolders,
} from "@/api/pick-folder/pick-folder.query";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useOptimizeCourseRoute } from "@/api/course-route/course-route.query";
import { CourseEditor } from "../../_components/CourseEditor";

function isShopRegionGroup(value: string | null): value is ShopRegionGroup {
  return (
    value !== null &&
    SHOP_REGION_GROUPS.some((regionGroup) => regionGroup === value)
  );
}

export function CourseCreateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const optimizeRouteMutation = useOptimizeCourseRoute();
  const folderId = searchParams.get("folderId");
  const regionGroupParam = searchParams.get("regionGroup");

  const regionGroup = isShopRegionGroup(regionGroupParam)
    ? regionGroupParam
    : null;

  const {
    data: folderData,
    isPending: isFolderPending,
    isError: isFolderError,
    refetch: refetchFolders,
  } = usePickFolders();

  const shopsQuery = useInfiniteShopsByFolder(folderId ?? undefined, 10, {
    regionGroup: regionGroup ?? undefined,
    courseEligibleOnly: true,
  });

  const createCourseMutation = useCreateCourse();

  if (!folderId || !regionGroup) {
    return (
      <StatePanel
        title="코스를 만들 지역 정보가 없어요"
        action="내 픽으로 돌아가기"
        onAction={() => {
          router.replace("/picks");
        }}
      />
    );
  }

  if (isFolderPending || shopsQuery.isPending) {
    return <div className="px-5 pt-16">코스 정보를 불러오는 중...</div>;
  }

  if (isFolderError) {
    return (
      <StatePanel
        title="내 픽 폴더를 불러오지 못했어요"
        action="다시 시도"
        onAction={() => {
          void refetchFolders();
        }}
      />
    );
  }

  if (shopsQuery.isError) {
    return (
      <StatePanel
        title="폴더의 상점을 불러오지 못했어요"
        action="다시 시도"
        onAction={() => {
          void shopsQuery.refetch();
        }}
      />
    );
  }

  const folder = folderData.items.find((item) => item.id === folderId) ?? null;

  if (!folder) {
    return (
      <StatePanel
        title="내 픽 폴더를 찾을 수 없어요"
        action="내 픽으로 돌아가기"
        onAction={() => {
          router.replace("/picks");
        }}
      />
    );
  }

  /**
   * 같은 폴더라도 지역별로 각각
   * 하나의 코스를 가질 수 있습니다.
   */
  const existingCourse = folder.courses.find(
    (course) => course.regionGroup === regionGroup,
  );

  if (existingCourse) {
    return (
      <StatePanel
        title="이미 만들어진 코스가 있어요"
        action="코스 수정하기"
        onAction={() => {
          router.replace(`/courses/${existingCourse.courseId}/edit`);
        }}
      />
    );
  }

  /**
   * 서버에서 이미
   * - regionGroup 일치
   * - active / temporarily_closed
   * - 위치 정보 존재
   *
   * 조건으로 필터링된 상점입니다.
   */
  const shops = shopsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const totalShopCount = shopsQuery.data?.pages[0]?.pagination.totalCount ?? 0;

  if (totalShopCount < 2) {
    return (
      <StatePanel
        title={`${SHOP_REGION_GROUP_LABELS[regionGroup]} 코스를 만들려면 상점이 2곳 이상 필요해요`}
        action="내 픽으로 돌아가기"
        onAction={() => {
          router.replace("/picks");
        }}
      />
    );
  }

  return (
    <CourseEditor
      heading={`${SHOP_REGION_GROUP_LABELS[regionGroup]} 코스 만들기`}
      initialTitle={folder.title}
      initialDescription=""
      initialSelectedShops={[]}
      shops={shops}
      hasNextPage={Boolean(shopsQuery.hasNextPage)}
      isFetchingNextPage={shopsQuery.isFetchingNextPage}
      isSubmitting={createCourseMutation.isPending}
      isOptimizing={optimizeRouteMutation.isPending}
      onOptimize={async (selectedShopIds, startShopId) => {
        const result = await optimizeRouteMutation.mutateAsync({
          sourceFolderId: folder.id,
          regionGroup,
          shopIds: selectedShopIds,
          startShopId,
        });

        return result.shopIds;
      }}
      submitLabel="코스 만들기"
      onLoadMore={() => {
        if (!shopsQuery.hasNextPage || shopsQuery.isFetchingNextPage) {
          return;
        }

        void shopsQuery.fetchNextPage();
      }}
      onSubmit={async (input) => {
        const result = await createCourseMutation.mutateAsync({
          sourceFolderId: folder.id,
          regionGroup,
          ...input,
        });

        router.replace(`/courses/${result.courseId}?created=true`);
      }}
    />
  );
}
