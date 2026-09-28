"use client";

import { useState } from "react";

import { usePickFolders } from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";
import { PickFolderEditView } from "./PickFolderEditView";
import { PickFolderManageItem } from "./PickFolderManageItem";

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

type EditingFolder = Readonly<{
  id: string;
  title: string;
}>;

export function PickFolderManageSheet({ open, onOpenChange }: Props) {
  const [editingFolder, setEditingFolder] = useState<EditingFolder | null>(
    null,
  );

  const { data: folderData, isPending, isError, refetch } = usePickFolders();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEditingFolder(null);
    }

    onOpenChange(nextOpen);
  };

  if (!open) {
    return null;
  }

  const folders = folderData?.items ?? [];

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      ariaLabelledBy="pick-folder-manage-title"
    >
      <BottomSheet.Handle />

      <BottomSheet.Header>
        <BottomSheet.Title id="pick-folder-manage-title">
          {editingFolder ? "내 픽 폴더 수정" : "내 픽 폴더 관리"}
        </BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        {editingFolder ? (
          <PickFolderEditView
            folderId={editingFolder.id}
            title={editingFolder.title}
            onBack={() => {
              setEditingFolder(null);
            }}
          />
        ) : isPending ? (
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
                onEdit={() => {
                  setEditingFolder({
                    id: folder.id,
                    title: folder.title,
                  });
                }}
              />
            ))}
          </div>
        )}
      </BottomSheet.Body>
    </BottomSheet>
  );
}
