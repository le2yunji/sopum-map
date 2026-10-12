"use client";

import { useState } from "react";

import {
  usePickFolders,
  useUpdatePickFolderOrder,
} from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";
import { PickFolderEditView } from "./PickFolderEditView";
import { PickFolderManageItem } from "./PickFolderManageItem";
import { getPickFolderErrorMessage, moveFolderId } from "../../picks-ui";

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

type EditingFolder = Readonly<{
  id: string;
  title: string;
  description: string | null;
}>;

/** 현재 작업 단계가 드러나는 바텀시트 제목을 반환합니다. */
function getManageSheetTitle(
  editingFolder: EditingFolder | null,
  isReordering: boolean,
) {
  if (editingFolder) {
    return "내 픽 폴더 수정";
  }

  if (isReordering) {
    return "내 픽 폴더 순서 변경";
  }

  return "내 픽 폴더 관리";
}

export function PickFolderManageSheet({ open, onOpenChange }: Props) {
  const [isReordering, setIsReordering] = useState(false);
  const [editingFolder, setEditingFolder] = useState<EditingFolder | null>(
    null,
  );

  const { data: folderData, isPending, isError, refetch } = usePickFolders();
  const orderMutation = useUpdatePickFolderOrder();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEditingFolder(null);
      setIsReordering(false);
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
          {getManageSheetTitle(editingFolder, isReordering)}
        </BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        {orderMutation.error ? (
          <p role="alert" className="mb-3 text-13 text-red-600">
            {getPickFolderErrorMessage(orderMutation.error)}
          </p>
        ) : null}
        {editingFolder ? (
          <PickFolderEditView
            folderId={editingFolder.id}
            title={editingFolder.title}
            description={editingFolder.description}
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
          <div>
            {!isReordering ? (
              <Button
                variant="secondary"
                fullWidth
                disabled={folders.length < 2}
                onClick={() => setIsReordering(true)}
              >
                순서 변경
              </Button>
            ) : null}

            <div className="mt-3 space-y-2">
              {folders.map((folder, index) => (
                <PickFolderManageItem
                  key={folder.id}
                  mode={isReordering ? "reorder" : "manage"}
                  folderId={folder.id}
                  title={folder.title}
                  shopCount={folder.shopCount}
                  canMoveUp={index > 0}
                  canMoveDown={index < folders.length - 1}
                  isOrdering={orderMutation.isPending}
                  onMove={(direction) => {
                    orderMutation.mutate({
                      folderIds: moveFolderId(
                        folders.map((item) => item.id),
                        folder.id,
                        direction,
                      ),
                    });
                  }}
                  onEdit={() => {
                    setEditingFolder({
                      id: folder.id,
                      title: folder.title,
                      description: folder.description,
                    });
                  }}
                />
              ))}
            </div>

            {isReordering ? (
              <Button
                variant="secondary"
                fullWidth
                className="mt-4"
                disabled={orderMutation.isPending}
                onClick={() => setIsReordering(false)}
              >
                완료
              </Button>
            ) : null}
          </div>
        )}
      </BottomSheet.Body>
    </BottomSheet>
  );
}
