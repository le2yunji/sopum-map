"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isApiError } from "@sopum-map/shared";

import {
  useInfiniteLikedShops,
  useInfiniteShopsByFolder,
  usePickFolderCourseRegions,
  usePickFolders,
} from "@/api/pick-folder/pick-folder.query";
import { CourseRegionSelectSheet } from "@/app/(main)/courses/_components/CourseRegionSelectSheet";
import { SettingIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

import { CreatePickFolderSheet } from "./folder/CreatePickFolderSheet";
import { PickFolderActions } from "./folder/PickFolderActions";
import { PickFolderTabs } from "./folder/PickFolderTabs";
import { PickFolderManageSheet } from "./folder/manage/PickFolderManageSheet";
import { PicksSkeleton } from "./PicksSkeleton";
import { PickShopGrid } from "./shop/PickShopGrid";
import {
  getCourseRegionDestination,
  getPickFolderErrorMessage,
} from "./picks-ui";

export const ALL_PICK_ID = "all";

export function PicksScreen() {
  const router = useRouter();

  const [activeFolderId, setActiveFolderId] = useState(ALL_PICK_ID);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const [manageFolderOpen, setManageFolderOpen] = useState(false);

  const [courseRegionSheetOpen, setCourseRegionSheetOpen] = useState(false);

  const {
    data: folderData,
    isPending: isFolderPending,
    isError: isFolderError,
    error: folderError,
    refetch: refetchFolders,
  } = usePickFolders();

  const likedShopsQuery = useInfiniteLikedShops(10);

  const folderShopsQuery = useInfiniteShopsByFolder(
    activeFolderId === ALL_PICK_ID ? undefined : activeFolderId,
    10,
  );

  const folders = folderData?.items ?? [];

  /**
   * 현재 선택된 특정 폴더입니다.
   *
   * 전체 탭에서는 null입니다.
   */
  const activeFolder =
    activeFolderId === ALL_PICK_ID
      ? null
      : (folders.find((folder) => folder.id === activeFolderId) ?? null);

  const courseRegionsQuery = usePickFolderCourseRegions(
    activeFolder?.id,
  );

  /**
   * 전체 탭에서는 좋아요한 모든 상점을,
   * 폴더 탭에서는 해당 폴더의 상점을 표시합니다.
   */
  const activeShopsQuery =
    activeFolderId === ALL_PICK_ID ? likedShopsQuery : folderShopsQuery;

  const shops =
    activeShopsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  /**
   * 현재 폴더의 지역별 코스 선택 Sheet를 엽니다.
   */
  const handleCreateCourse = () => {
    if (!activeFolder) {
      return;
    }

    const destination = courseRegionsQuery.data
      ? getCourseRegionDestination(
          activeFolder.id,
          courseRegionsQuery.data.items,
        )
      : null;

    if (destination) {
      router.push(destination);
      return;
    }

    setCourseRegionSheetOpen(true);
  };

  if (isFolderError) {
    const isUnauthorized = isApiError(folderError) && folderError.status === 401;

    return (
      <StatePanel
        title={getPickFolderErrorMessage(folderError)}
        action={isUnauthorized ? "로그인" : "다시 시도"}
        actionHref={isUnauthorized ? "/login" : undefined}
        onAction={isUnauthorized ? undefined : () => void refetchFolders()}
      />
    );
  }

  if (isFolderPending) {
    return <PicksSkeleton />;
  }

  return (
    <section className="min-h-full bg-white px-5 pb-24 pt-16">
      <PicksHeader
        onOpenManage={() => {
          setManageFolderOpen(true);
        }}
      />

      <PickFolderManageSheet
        open={manageFolderOpen}
        onOpenChange={setManageFolderOpen}
      />

      <PickFolderTabs
        folders={folders}
        activeFolderId={activeFolderId}
        onChange={(folderId) => {
          setActiveFolderId(folderId);
          setCourseRegionSheetOpen(false);
        }}
      />

      <PickShopGrid
        shops={shops}
        isAll={activeFolderId === ALL_PICK_ID}
        isPending={activeShopsQuery.isPending}
        isError={activeShopsQuery.isError}
        isFetchingNextPage={activeShopsQuery.isFetchingNextPage}
        hasNextPage={Boolean(activeShopsQuery.hasNextPage)}
        onRetry={() => {
          void activeShopsQuery.refetch();
        }}
        onLoadMore={() => {
          if (
            !activeShopsQuery.hasNextPage ||
            activeShopsQuery.isFetchingNextPage
          ) {
            return;
          }

          void activeShopsQuery.fetchNextPage();
        }}
      />

      <PickFolderActions
        activeFolderId={activeFolder?.id ?? null}
        onCreateCourse={handleCreateCourse}
        onCreateFolder={() => {
          setCreateFolderOpen(true);
        }}
      />

      <CreatePickFolderSheet
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        folders={folders}
        onCreated={(folderId) => {
          setActiveFolderId(folderId);
        }}
      />

      {activeFolder ? (
        <CourseRegionSelectSheet
          open={courseRegionSheetOpen}
          folderId={activeFolder.id}
          onOpenChange={setCourseRegionSheetOpen}
          onSelect={(region) => {
            setCourseRegionSheetOpen(false);

            if (region.courseId) {
              router.push(`/courses/${region.courseId}/edit`);

              return;
            }

            router.push(
              `/courses/new?folderId=${activeFolder.id}&regionGroup=${region.regionGroup}`,
            );
          }}
        />
      ) : null}
    </section>
  );
}

function PicksHeader({
  onOpenManage,
}: Readonly<{
  onOpenManage: () => void;
}>) {
  return (
    <header className="flex items-end justify-between">
      <div>
        <p className="text-12 text-green-700">픽한 상점</p>

        <h1 className="mt-1 text-24 font-semibold">내 픽</h1>
      </div>

      <Button
        iconOnly
        variant="ghost"
        size="small"
        aria-label="내 픽 폴더 관리"
        onClick={onOpenManage}
      >
        <SettingIcon className="size-7 text-black-800" />
      </Button>
    </header>
  );
}
