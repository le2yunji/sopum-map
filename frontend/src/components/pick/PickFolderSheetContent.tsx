"use client";

import { useState } from "react";
import type { PickFolderListItem } from "@sopum-map/shared";

import { useUpdateFolderIdsByShop } from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";
import { getPickFolderErrorMessage } from "@/app/(main)/(tabs)/picks/_components/picks-ui";

type Props = Readonly<{
  shopId: string;
  folders: readonly Pick<PickFolderListItem, "id" | "title" | "shopCount">[];
  initialFolderIds: string[];
  onOpenChange: (open: boolean) => void;
}>;

export function PickFolderSheetContent({
  shopId,
  folders,
  initialFolderIds,
  onOpenChange,
}: Props) {
  const [selectedFolderIds, setSelectedFolderIds] = useState(initialFolderIds);

  const updateFolderMutation = useUpdateFolderIdsByShop(shopId);

  const handleToggleFolder = (folderId: string) => {
    setSelectedFolderIds((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  };

  const handleSave = () => {
    updateFolderMutation.mutate(
      {
        folderIds: selectedFolderIds,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <>
      <BottomSheet.Body>
        {folders.length === 0 ? (
          <p className="px-3 py-4 text-14 text-black-500">
            생성된 내 픽 폴더가 없습니다.
          </p>
        ) : (
          <fieldset className="space-y-2">
            <legend className="sr-only">폴더 선택</legend>

            {folders.map((folder) => {
              const isSelected = selectedFolderIds.includes(folder.id);

              return (
                <label
                  key={folder.id}
                  className={[
                    "flex min-h-11 cursor-pointer",
                    "items-center gap-3 rounded-xl px-3",
                    isSelected ? "bg-green-100" : "hover:bg-black-100",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    value={folder.id}
                    checked={isSelected}
                    onChange={() => {
                      handleToggleFolder(folder.id);
                    }}
                  />

                  <span className="flex-1 text-14">{folder.title}</span>

                  <span className="text-12 text-black-500">
                    {folder.shopCount}
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}
      </BottomSheet.Body>

      <BottomSheet.Footer>
        {updateFolderMutation.error ? (
          <p role="alert" className="mb-2 text-13 text-red-600">
            {getPickFolderErrorMessage(updateFolderMutation.error)}
          </p>
        ) : null}
        <Button
          fullWidth
          isLoading={updateFolderMutation.isPending}
          onClick={handleSave}
        >
          저장
        </Button>
      </BottomSheet.Footer>
    </>
  );
}
