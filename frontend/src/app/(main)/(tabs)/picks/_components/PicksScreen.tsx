"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  useInfiniteLikedShops,
  useInfiniteShopsByFolder,
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

    setCourseRegionSheetOpen(true);
  };

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
