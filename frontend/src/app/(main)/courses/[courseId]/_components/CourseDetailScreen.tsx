"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SHOP_REGION_GROUP_LABELS, type CourseDetailShop } from "@sopum-map/shared";

import {
  useCourseDetail,
  useDeleteCourse,
  useLikeCourse,
  useUnlikeCourse,
  useUpdateCourseVisibility,
} from "@/api/course/course.query";
import { Snackbar } from "@/components/ui/Snackbar";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import {
  createNaverMapWalkRouteBetweenUrl,
  createNaverMapWalkRouteUrl,
} from "@/utils/naver-map";

import { CourseDetailHeader } from "./CourseDetailHeader";
import { CourseDetailShopItem } from "./CourseDetailShopItem";
import { CourseMap } from "./CourseMap";
import { CourseMoreSheet } from "./CourseMoreSheet";
import { CourseShopActionSheet } from "./CourseShopActionSheet";
import { CourseVisibilitySheet } from "./CourseVisibilitySheet";
import { DeleteCourseSheet } from "./DeleteCourseSheet";

type Props = Readonly<{ courseId: string }>;
type SelectedShop = Readonly<{
  shop: CourseDetailShop;
  previousShop: CourseDetailShop | null;
}>;

/** 코스 상세 데이터와 소유권에 맞는 헤더·지도·방문 순서 액션을 연결합니다. */
export function CourseDetailScreen({ courseId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: course, isPending, isError, refetch } = useCourseDetail(courseId);
  const deleteCourseMutation = useDeleteCourse();
  const likeMutation = useLikeCourse();
  const unlikeMutation = useUnlikeCourse();
  const visibilityMutation = useUpdateCourseVisibility();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [visibilitySheetOpen, setVisibilitySheetOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isCreated = searchParams.get("created") === "true";
  const isUpdated = searchParams.get("updated") === "true";
  const queryNotice = isCreated
    ? "코스가 만들어졌어요."
    : isUpdated
      ? "코스가 수정되었어요."
      : null;

  useEffect(() => {
    if (!isCreated && !isUpdated) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(`/courses/${courseId}`, { scroll: false });
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [courseId, isCreated, isUpdated, router]);

  const orderedShops = useMemo(
    () => course ? [...course.shops].sort((first, second) => first.order - second.order) : [],
    [course],
  );

  /** Web Share를 먼저 쓰고 지원되지 않으면 주소 복사로 대체합니다. */
  const handleShare = async () => {
    if (!course) {
      return;
    }

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: course.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("코스 링크를 복사했어요.");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setNotice("코스 링크를 복사했어요.");
      } catch {
        setNotice("코스 링크를 공유하지 못했어요.");
      }
    }
  };

  /** 선택한 상점을 기준으로 네이버 지도 도보 길찾기를 엽니다. */
  const handleOpenRoute = () => {
    if (!selectedShop) {
      return;
    }

    const { shop, previousShop } = selectedShop;
    const routeUrl = previousShop
      ? createNaverMapWalkRouteBetweenUrl({
          start: {
            name: previousShop.name,
            latitude: previousShop.latitude,
            longitude: previousShop.longitude,
          },
          destination: {
            name: shop.name,
            latitude: shop.latitude,
            longitude: shop.longitude,
          },
        })
      : createNaverMapWalkRouteUrl({
          name: shop.name,
          latitude: shop.latitude,
          longitude: shop.longitude,
        });

    window.location.href = routeUrl;
  };

  /** 삭제 성공 후 목록 화면으로 돌아갑니다. */
  const handleDeleteCourse = async () => {
    try {
      await deleteCourseMutation.mutateAsync(courseId);
      router.replace("/picks?courseDeleted=true");
    } catch {
      setNotice("코스를 삭제하지 못했어요.");
    }
  };

  if (isPending) {
    return <div role="status" aria-label="코스를 불러오는 중" className="px-5 pt-16">코스 정보를 불러오는 중...</div>;
  }

  if (isError || !course) {
    return <StatePanel title="코스를 불러오지 못했어요" action="다시 시도" onAction={() => void refetch()} />;
  }

  return (
    <section className="min-h-full bg-white pb-14">
      <div className="px-5 pt-4">
        <CourseDetailHeader
          course={course}
          likePending={likeMutation.isPending || unlikeMutation.isPending}
          visibilityPending={visibilityMutation.isPending}
          onBack={() => router.back()}
          onShare={() => void handleShare()}
          onMore={() => setMoreSheetOpen(true)}
          onLikeToggle={() => {
            const mutation = course.isLiked ? unlikeMutation : likeMutation;
            mutation.mutate(course.id);
          }}
          onVisibilityClick={() => setVisibilitySheetOpen(true)}
        />

        <span className="mt-5 inline-flex rounded-full bg-green-50 px-3 py-1.5 text-12 font-semibold text-green-700">
          {SHOP_REGION_GROUP_LABELS[course.regionGroup]}
        </span>
      </div>

      <div className="mt-7">
        <CourseMap shops={orderedShops} />
      </div>

      <section className="px-5 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-16 font-semibold">방문 순서</h2>
          <span className="text-12 text-black-500">{orderedShops.length}곳</span>
        </div>

        {orderedShops.length === 0 ? (
          <p className="mt-4 text-14 text-black-500">아직 코스에 담긴 상점이 없습니다.</p>
        ) : (
          <ol className="mt-6">
            {orderedShops.map((shop, index) => (
              <CourseDetailShopItem
                key={shop.id}
                shop={shop}
                nextShop={orderedShops[index + 1] ?? null}
                onOpenActions={() => {
                  setSelectedShop({ shop, previousShop: orderedShops[index - 1] ?? null });
                }}
              />
            ))}
          </ol>
        )}
      </section>

      <CourseMoreSheet
        open={moreSheetOpen}
        onOpenChange={setMoreSheetOpen}
        onEdit={() => router.push(`/courses/${course.id}/edit`)}
        onDelete={() => {
          setMoreSheetOpen(false);
          setDeleteSheetOpen(true);
        }}
      />
      <CourseVisibilitySheet
        open={visibilitySheetOpen}
        isPublic={course.isPublic}
        isPending={visibilityMutation.isPending}
        onOpenChange={setVisibilitySheetOpen}
        onConfirm={() => {
          visibilityMutation.mutate(
            { courseId: course.id, isPublic: !course.isPublic },
            {
              onSuccess: () => setVisibilitySheetOpen(false),
              onError: () => setNotice("공개 상태를 바꾸지 못했어요."),
            },
          );
        }}
      />
      <CourseShopActionSheet
        open={selectedShop !== null}
        shop={selectedShop?.shop ?? null}
        onOpenChange={(open) => {
          if (!open) setSelectedShop(null);
        }}
        onViewShop={() => {
          if (selectedShop) router.push(`/shops/${selectedShop.shop.id}`);
        }}
        onOpenRoute={handleOpenRoute}
      />
      <DeleteCourseSheet
        open={deleteSheetOpen}
        isPending={deleteCourseMutation.isPending}
        onOpenChange={setDeleteSheetOpen}
        onConfirm={() => void handleDeleteCourse()}
      />
      <Snackbar open={queryNotice !== null || notice !== null} message={notice ?? queryNotice ?? ""} />
    </section>
  );
}
