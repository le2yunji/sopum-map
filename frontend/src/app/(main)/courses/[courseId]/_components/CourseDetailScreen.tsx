"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { CourseDetailShop } from "@sopum-map/shared";

import {
  useCourseDetail,
  useDeleteCourse,
  useLikeCourse,
  useUnlikeCourse,
  useUpdateCourseVisibility,
  useSetCourseShopVisited,
  useUnsetCourseShopVisited,
} from "@/api/course/course.query";
import { useCourseWalkingRoute } from "@/api/course-route/course-route.query";
import { Snackbar } from "@/components/ui/Snackbar";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  createNaverMapWalkRouteBetweenUrl,
  createNaverMapWalkRouteUrl,
} from "@/utils/naver-map";

import { EXPANDED_TOP_OFFSET } from "../_hooks/courseVisitOrderSheet";

import { CourseDetailHeader } from "./CourseDetailHeader";
import { CourseRouteMap } from "./CourseRouteMap";
import { CourseMoreSheet } from "./CourseMoreSheet";
import { CourseShopActionSheet } from "./CourseShopActionSheet";
import { CourseShopVisitSheet } from "./CourseShopVisitSheet";
import { CourseVisibilitySheet } from "./CourseVisibilitySheet";
import { CourseVisitOrderSheet } from "./CourseVisitOrderSheet";
import { DeleteCourseSheet } from "./DeleteCourseSheet";

type Props = Readonly<{
  courseId: string;
  mapClientId?: string | null;
}>;
type SelectedShop = Readonly<{
  shop: CourseDetailShop;
  previousShop: CourseDetailShop | null;
}>;

/** 코스 상세 데이터와 소유권에 맞는 헤더·지도·방문 순서 액션을 연결합니다. */
export function CourseDetailScreen({ courseId, mapClientId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    data: course,
    isPending,
    isError,
    refetch,
  } = useCourseDetail(courseId);
  const {
    data: walkingRoute,
    isPending: isWalkingRoutePending,
    isError: isWalkingRouteError,
  } = useCourseWalkingRoute(course?.id);
  const { data: currentUser } = useCurrentUser();
  const deleteCourseMutation = useDeleteCourse();
  const likeMutation = useLikeCourse();
  const unlikeMutation = useUnlikeCourse();
  const visibilityMutation = useUpdateCourseVisibility();
  const setVisitedMutation = useSetCourseShopVisited();
  const unsetVisitedMutation = useUnsetCourseShopVisited();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [visibilitySheetOpen, setVisibilitySheetOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const screenRef = useRef<HTMLElement>(null);
  const courseInfoRef = useRef<HTMLElement>(null);
  const [visitOrderExpandedTopOffset, setVisitOrderExpandedTopOffset] =
    useState(EXPANDED_TOP_OFFSET);
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [visitPromptShop, setVisitPromptShop] =
    useState<CourseDetailShop | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isCreated = searchParams.get("created") === "true";
  const isUpdated = searchParams.get("updated") === "true";

  const queryNotice = isCreated
    ? "코스가 만들어졌어요."
    : isUpdated
      ? "코스가 수정되었어요."
      : null;

  useLayoutEffect(() => {
    const screen = screenRef.current;
    const courseInfo = courseInfoRef.current;

    if (!screen || !courseInfo) {
      return;
    }

    /** 코스 정보 카드의 실제 윗선을 방문 순서 시트의 펼침 위치로 동기화합니다. */
    const updateExpandedTopOffset = () => {
      const nextOffset =
        courseInfo.getBoundingClientRect().top -
        screen.getBoundingClientRect().top;

      if (nextOffset < 0) {
        return;
      }

      setVisitOrderExpandedTopOffset((currentOffset) =>
        Math.abs(currentOffset - nextOffset) < 0.5 ? currentOffset : nextOffset,
      );
    };

    updateExpandedTopOffset();
    const observer = new ResizeObserver(updateExpandedTopOffset);
    observer.observe(screen);
    observer.observe(courseInfo);
    return () => observer.disconnect();
  }, [course?.id, infoOpen]);

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
    () =>
      course
        ? [...course.shops].sort((first, second) => first.order - second.order)
        : [],
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
    if (shop.latitude === null || shop.longitude === null) {
      setNotice("이 상점은 위치 정보가 없어 길찾기를 열 수 없어요.");
      return;
    }

    const routeUrl =
      previousShop &&
      previousShop.latitude !== null &&
      previousShop.longitude !== null
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

  /** 방문 상태를 저장한 뒤 선택에 따라 방문 로그 작성 화면으로 이동합니다. */
  const handleRecordVisit = async (writeLog: boolean) => {
    if (!visitPromptShop) {
      return;
    }

    try {
      await setVisitedMutation.mutateAsync({
        courseId,
        shopId: visitPromptShop.id,
      });
      const visitedShopId = visitPromptShop.id;
      setVisitPromptShop(null);

      if (writeLog) {
        const returnTo = encodeURIComponent(`/courses/${courseId}`);
        router.push(
          `/shops/${visitedShopId}/visit-logs/new?returnTo=${returnTo}`,
        );
      } else {
        setNotice("방문 완료로 표시했어요.");
      }
    } catch {
      setNotice("방문 상태를 저장하지 못했어요.");
    }
  };

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="코스를 불러오는 중"
        className="grid h-dvh min-h-[560px] place-items-center bg-green-50"
      >
        코스 정보를 불러오는 중...
      </div>
    );
  }

  if (isError || !course) {
    return (
      <StatePanel
        title="코스를 불러오지 못했어요"
        action="다시 시도"
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <section
      ref={screenRef}
      aria-label="코스 지도 화면"
      className="relative h-dvh min-h-[560px] overflow-hidden bg-green-50"
    >
      <CourseRouteMap
        shops={orderedShops}
        walkingRoute={walkingRoute}
        isRoutePending={isWalkingRoutePending}
        isRouteError={isWalkingRouteError}
        mapClientId={mapClientId}
      />

      <CourseDetailHeader
        course={course}
        likePending={likeMutation.isPending || unlikeMutation.isPending}
        visibilityPending={visibilityMutation.isPending}
        currentUserNickname={currentUser?.nickname}
        infoOpen={infoOpen}
        infoSectionRef={courseInfoRef}
        onBack={() => router.back()}
        onShare={() => void handleShare()}
        onMore={() => setMoreSheetOpen(true)}
        onCloseInfo={() => setInfoOpen(false)}
        onOpenInfo={() => setInfoOpen(true)}
        onLikeToggle={() => {
          const mutation = course.isLiked ? unlikeMutation : likeMutation;
          mutation.mutate(course.id);
        }}
        onVisibilityClick={() => setVisibilitySheetOpen(true)}
      />

      <CourseVisitOrderSheet
        expandedTopOffset={visitOrderExpandedTopOffset}
        shops={orderedShops}
        onOpenShopActions={(shop, previousShop) => {
          setSelectedShop({ shop, previousShop });
        }}
      />

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
        isVisitPending={
          setVisitedMutation.isPending || unsetVisitedMutation.isPending
        }
        onVisitToggle={() => {
          if (!selectedShop) {
            return;
          }

          if (!selectedShop.shop.isVisited) {
            setVisitPromptShop(selectedShop.shop);
            setSelectedShop(null);
            return;
          }

          unsetVisitedMutation.mutate(
            { courseId: course.id, shopId: selectedShop.shop.id },
            {
              onSuccess: () => {
                setSelectedShop(null);
                setNotice("방문 완료를 취소했어요.");
              },
              onError: () => setNotice("방문 상태를 저장하지 못했어요."),
            },
          );
        }}
      />
      <CourseShopVisitSheet
        open={visitPromptShop !== null}
        isPending={setVisitedMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setVisitPromptShop(null);
        }}
        onRecordOnly={() => void handleRecordVisit(false)}
        onWriteLog={() => void handleRecordVisit(true)}
      />
      <DeleteCourseSheet
        open={deleteSheetOpen}
        isPending={deleteCourseMutation.isPending}
        onOpenChange={setDeleteSheetOpen}
        onConfirm={() => void handleDeleteCourse()}
      />
      <Snackbar
        open={queryNotice !== null || notice !== null}
        message={notice ?? queryNotice ?? ""}
      />
    </section>
  );
}
