"use client";

import { useState } from "react";

import {
  useDeletePickFolder,
  usePickFolders,
  useUpdatePickFolder,
} from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function PickFolderManageSheet({ open, onOpenChange }: Props) {
  const { data: folderData, isPending, isError, refetch } = usePickFolders();

  if (!open) {
    return null;
  }

  const folders = folderData?.items ?? [];

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="pick-folder-manage-title"
    >
      <BottomSheet.Handle />

      <BottomSheet.Header>
        <BottomSheet.Title id="pick-folder-manage-title">
          내 픽 폴더 관리
        </BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        {isPending ? (
          <p className="px-3 py-4 text-14 text-black-500">
            폴더를 불러오는 중입니다.
          </p>
        ) : isError ? (
          <div className="px-3 py-4">
            <p className="text-14 text-black-500">폴더를 불러오지 못했어요.</p>

            <Button
              variant="ghost"
              size="small"
              className="mt-2"
              onClick={() => {
                void refetch();
              }}
            >
              다시 시도
            </Button>
          </div>
        ) : folders.length === 0 ? (
          <p className="px-3 py-4 text-14 text-black-500">
            생성된 내 픽 폴더가 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {folders.map((folder) => (
              <PickFolderManageItem
                key={folder.id}
                folderId={folder.id}
                title={folder.title}
                shopCount={folder.shopCount}
              />
            ))}
          </div>
        )}
      </BottomSheet.Body>
    </BottomSheet>
  );
}

type PickFolderManageItemProps = Readonly<{
  folderId: string;
  title: string;
  shopCount: number;
}>;

function PickFolderManageItem({
  folderId,
  title,
  shopCount,
}: PickFolderManageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const updateFolderMutation = useUpdatePickFolder(folderId);

  const deleteFolderMutation = useDeletePickFolder();

  const normalizedTitle = draftTitle.trim();

  const isChanged = normalizedTitle.length > 0 && normalizedTitle !== title;

  const handleCancelEdit = () => {
    setDraftTitle(title);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    if (!isChanged || updateFolderMutation.isPending) {
      return;
    }

    updateFolderMutation.mutate(
      {
        title: normalizedTitle,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (deleteFolderMutation.isPending) {
      return;
    }

    deleteFolderMutation.mutate(folderId);
  };

  return (
    <div className="rounded-xl border border-black-100 px-3 py-1">
      {isEditing ? (
        <div>
          <label htmlFor={`pick-folder-title-${folderId}`} className="sr-only">
            폴더 이름
          </label>

          <input
            id={`pick-folder-title-${folderId}`}
            value={draftTitle}
            maxLength={50}
            autoFocus
            onChange={(event) => {
              setDraftTitle(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                handleCancelEdit();
              }
            }}
            className="
              min-h-11 w-full rounded-lg
              border border-black-300 px-3
              text-14 outline-none
              focus:border-green-500
              focus:ring-2 focus:ring-green-500/20
            "
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="small" onClick={handleCancelEdit}>
              취소
            </Button>

            <Button
              size="small"
              isLoading={updateFolderMutation.isPending}
              disabled={!isChanged}
              onClick={handleUpdate}
            >
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="truncate text-14 font-medium">{title}</div>

            <div className="shrink-0 text-12 text-black-500">{shopCount}</div>
          </div>

          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            수정
          </Button>

          <Button
            variant="ghost"
            size="small"
            isLoading={deleteFolderMutation.isPending}
            onClick={handleDelete}
            className="text-red-600"
          >
            삭제
          </Button>
        </div>
      )}
    </div>
  );
}
