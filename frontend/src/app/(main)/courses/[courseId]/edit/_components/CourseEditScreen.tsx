"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useCourseDetail, useUpdateCourse } from "@/api/course/course.query";
import { useInfiniteShopsByFolder } from "@/api/pick-folder/pick-folder.query";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

import {
  CourseEditor,
  type CourseEditorShopOption,
} from "../../../_components/CourseEditor";

type Props = Readonly<{
  courseId: string;
}>;

export function CourseEditScreen({ courseId }: Props) {
  const router = useRouter();

  const {
    data: course,
    isPending: isCoursePending,
    isError: isCourseError,
    refetch: refetchCourse,
  } = useCourseDetail(courseId);

  const folderShopsQuery = useInfiniteShopsByFolder(
    course?.sourceFolderId ?? undefined,
    10,
    {
      regionGroup: course?.regionGroup,
      courseEligibleOnly: true,
    },
  );

  const updateCourseMutation = useUpdateCourse();

  /**
   * 기존 코스 상점과 출처 폴더의 같은 지역 상점을 합칩니다.
   *
   * 기존 코스 상점은 이후 좋아요를 해제했더라도
   * 수정 화면에서 사라지면 안 됩니다.
   */
  const shopOptions = useMemo<CourseEditorShopOption[]>(() => {
    if (!course) {
      return [];
    }

    const options = new Map<string, CourseEditorShopOption>();

    /**
     * 기존 코스 상점을 먼저 추가합니다.
     *
     * 따라서 좋아요가 해제된 상점도
     * 수정 화면에 계속 표시됩니다.
     */
    for (const shop of course.shops) {
      options.set(shop.id, {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        mainImageUrl: shop.mainImageUrl,
      });
    }

    /** 출처 폴더에서 조회한 같은 지역 상점을 중복 없이 추가합니다. */
    const folderShops =
      folderShopsQuery.data?.pages.flatMap((page) => page.items) ?? [];

    for (const shop of folderShops) {
      options.set(shop.id, {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        mainImageUrl: shop.mainImageUrl,
      });
    }

    return [...options.values()];
  }, [course, folderShopsQuery.data]);

  const isFolderShopsPending =
    Boolean(course?.sourceFolderId) && folderShopsQuery.isPending;

  if (isCoursePending || isFolderShopsPending) {
    return <div className="px-5 pt-16">코스 정보를 불러오는 중...</div>;
  }

  if (isCourseError || !course) {
    return (
      <StatePanel
        title="코스를 불러오지 못했어요"
        action="다시 시도"
        onAction={() => {
          void refetchCourse();
        }}
      />
    );
  }

  if (folderShopsQuery.isError) {
    return (
      <StatePanel
        title="상점 목록을 불러오지 못했어요"
        action="다시 시도"
        onAction={() => {
          void folderShopsQuery.refetch();
        }}
      />
    );
  }

  return (
    <CourseEditor
      heading="코스 수정"
      initialTitle={course.title}
      initialDescription={course.description ?? ""}
      initialSelectedShops={course.shops
        .slice()
        .sort((first, second) => first.order - second.order)
        .map((shop) => ({
          shopId: shop.id,
          order: shop.order,
          memo: shop.memo,
        }))}
      shops={shopOptions}
      hasNextPage={Boolean(folderShopsQuery.hasNextPage)}
      isFetchingNextPage={folderShopsQuery.isFetchingNextPage}
      isSubmitting={updateCourseMutation.isPending}
      submitLabel="코스 수정하기"
      onLoadMore={() => {
        void folderShopsQuery.fetchNextPage();
      }}
      onSubmit={async (input) => {
        await updateCourseMutation.mutateAsync({
          courseId,
          input: {
            title: input.title,
            description: input.description,
            shops: input.shops,
          },
        });

        router.replace(`/courses/${courseId}?updated=true`);
      }}
    />
  );
}
