"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useCourseDetail, useUpdateCourse } from "@/api/course/course.query";
import { useInfiniteLikedShops } from "@/api/pick-folder/pick-folder.query";
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

  const likedShopsQuery = useInfiniteLikedShops(10);

  const updateCourseMutation = useUpdateCourse();

  /**
   * 현재 좋아요한 모든 상점 중
   * 지금까지 불러온 페이지를 하나의 배열로 합칩니다.
   */
  const likedShops =
    likedShopsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  /**
   * 기존 코스 상점과 현재 좋아요 상점을 합칩니다.
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

    /**
     * 현재 좋아요 상점을 추가합니다.
     *
     * 같은 상점은 Map key가 같기 때문에
     * 중복으로 표시되지 않습니다.
     */
    for (const shop of likedShops) {
      options.set(shop.id, {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        mainImageUrl: shop.mainImageUrl,
      });
    }

    return [...options.values()];
  }, [course, likedShops]);

  if (isCoursePending || likedShopsQuery.isPending) {
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

  if (likedShopsQuery.isError) {
    return (
      <StatePanel
        title="상점 목록을 불러오지 못했어요"
        action="다시 시도"
        onAction={() => {
          void likedShopsQuery.refetch();
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
      hasNextPage={Boolean(likedShopsQuery.hasNextPage)}
      isFetchingNextPage={likedShopsQuery.isFetchingNextPage}
      isSubmitting={updateCourseMutation.isPending}
      submitLabel="코스 수정하기"
      onLoadMore={() => {
        void likedShopsQuery.fetchNextPage();
      }}
      onSubmit={async (input) => {
        await updateCourseMutation.mutateAsync({
          courseId,
          input,
        });

        router.replace(`/courses/${courseId}?updated=true`);
      }}
    />
  );
}
