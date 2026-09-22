"use client";

import { useState } from "react";

import {
  useInfiniteLikedShops,
  useInfiniteShopsByFolder,
  usePickFolders,
} from "@/api/pick-folder/pick-folder.query";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

import { CreatePickFolderSheet } from "./CreatePickFolderSheet";
import { PickFolderActions } from "./PickFolderActions";
import { PickFolderTabs } from "./PickFolderTabs";
import { PickShopGrid } from "./PickShopGrid";
import { PicksSkeleton } from "./PicksSkeleton";
import { SettingIcon } from "@/components/icons";

export const ALL_PICK_ID = "all";

type Props = Readonly<{
  onCreateCourse?: (folderId: string | null) => void;
}>;

export function PicksScreen({ onCreateCourse = () => undefined }: Props) {
  const [activeFolderId, setActiveFolderId] = useState(ALL_PICK_ID);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

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
   * 전체 탭에서는 좋아요한 모든 상점을,
   * 폴더 탭에서는 해당 폴더의 상점을 표시합니다.
   */
  const activeShopsQuery =
    activeFolderId === ALL_PICK_ID ? likedShopsQuery : folderShopsQuery;

  const shops =
    activeShopsQuery.data?.pages.flatMap((page) => page.items) ?? [];

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
      <PicksHeader />

      <PickFolderTabs
        folders={folders}
        activeFolderId={activeFolderId}
        onChange={setActiveFolderId}
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
          void activeShopsQuery.fetchNextPage();
        }}
      />

      <PickFolderActions
        activeFolderId={activeFolderId === ALL_PICK_ID ? null : activeFolderId}
        onCreateCourse={onCreateCourse}
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
    </section>
  );
}

function PicksHeader() {
  return (
    <header className="flex items-end justify-between">
      <div>
        <p className="text-12 text-green-700">픽한 상점</p>
        <h1 className="mt-1 text-24 font-semibold">내 픽</h1>
      </div>

      <SettingIcon className="size-7 text-black-800" />
    </header>
  );
}
