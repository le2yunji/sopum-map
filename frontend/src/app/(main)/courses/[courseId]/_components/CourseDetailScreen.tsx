"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCourseDetail, useDeleteCourse } from "@/api/course/course.query";
import { Button } from "@/components/ui/Button";
import { Snackbar } from "@/components/ui/Snackbar";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

import { CourseDetailShopItem } from "./CourseDetailShopItem";
import { CourseMap } from "./CourseMap";
import { DeleteCourseSheet } from "./DeleteCourseSheet";

type Props = Readonly<{
  courseId: string;
}>;

export function CourseDetailScreen({ courseId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: course,
    isPending,
    isError,
    refetch,
  } = useCourseDetail(courseId);

  const deleteCourseMutation = useDeleteCourse();

  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

  const isCreated = searchParams.get("created") === "true";

  const isUpdated = searchParams.get("updated") === "true";

  const snackbarMessage = isCreated
    ? "코스가 만들어졌어요."
    : isUpdated
      ? "코스가 수정되었어요."
      : null;

  useEffect(() => {
    if (!isCreated && !isUpdated) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(`/courses/${courseId}`, {
        scroll: false,
      });
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [courseId, isCreated, isUpdated, router]);

  const orderedShops = useMemo(
    () =>
      course
        ? [...course.shops].sort(
            (first, second) => first.order - second.order,
          )
        : [],
    [course],
  );

  const handleDeleteCourse = async () => {
    try {
      await deleteCourseMutation.mutateAsync(courseId);

      router.replace("/picks?courseDeleted=true");
    } catch {
      // 삭제 실패 시 Sheet 유지
    }
  };

  if (isPending) {
    return (
      <div role="status" aria-label="코스를 불러오는 중" className="px-5 pt-16">
        코스 정보를 불러오는 중...
      </div>
    );
  }

  if (isError || !course) {
    return (
      <StatePanel
        title="코스를 불러오지 못했어요"
        action="다시 시도"
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <section className="min-h-full bg-white px-5 pb-28 pt-16">
      <header>
        <p className="text-12 text-green-700">코스</p>

        <h1 className="mt-1 text-24 font-semibold">{course.title}</h1>

        {course.description ? (
          <p className="mt-3 whitespace-pre-line text-14 text-black-600">
            {course.description}
          </p>
        ) : null}
      </header>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-16 font-semibold">코스 지도</h2>

          <span className="text-12 text-black-500">
            {orderedShops.length}곳
          </span>
        </div>

        <div className="mt-4">
          <CourseMap shops={orderedShops} />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-16 font-semibold">방문 순서</h2>

          <span className="text-12 text-black-500">
            {orderedShops.length}곳
          </span>
        </div>

        {orderedShops.length === 0 ? (
          <p className="mt-4 text-14 text-black-500">
            아직 코스에 담긴 상점이 없습니다.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {orderedShops.map((shop, index) => (
              <CourseDetailShopItem
                key={shop.id}
                shop={shop}
                previousShop={index > 0 ? orderedShops[index - 1] : null}
              />
            ))}
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[440px] gap-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              setDeleteSheetOpen(true);
            }}
          >
            삭제
          </Button>

          <Button
            type="button"
            fullWidth
            onClick={() => {
              router.push(`/courses/${course.id}/edit`);
            }}
          >
            코스 수정
          </Button>
        </div>
      </div>

      <Snackbar
        open={snackbarMessage !== null}
        message={snackbarMessage ?? ""}
      />

      <DeleteCourseSheet
        open={deleteSheetOpen}
        isPending={deleteCourseMutation.isPending}
        onOpenChange={setDeleteSheetOpen}
        onConfirm={() => {
          void handleDeleteCourse();
        }}
      />
    </section>
  );
}
