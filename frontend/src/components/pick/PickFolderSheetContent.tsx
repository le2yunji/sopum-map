"use client";

import { useState } from "react";

import { useUpdateFolderIdsByShop } from "@/api/pick-folder/pick-folder.query";
import { SettingIcon } from "@/components/icons";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";

type PickFolder = Readonly<{
  id: string;
  title: string;
  shopCount: number;
}>;

type Props = Readonly<{
  shopId: string;
  folders: PickFolder[];
  initialFolderIds: string[];
  onOpenChange: (open: boolean) => void;
}>;

type PickFolderSheetMode = "select" | "manage";

export function PickFolderSheetContent({
  shopId,
  folders,
  initialFolderIds,
  onOpenChange,
}: Props) {
  const [selectedFolderIds, setSelectedFolderIds] = useState(initialFolderIds);

  const [mode, setMode] = useState<PickFolderSheetMode>("select");

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
    <BottomSheet
      open
      onOpenChange={onOpenChange}
      ariaLabelledBy="pick-folder-title"
    >
      <BottomSheet.Handle />

      <BottomSheet.Header>
        <BottomSheet.Title id="pick-folder-title">
          {mode === "select" ? "내 픽 폴더 선택" : "내 픽 폴더 관리"}
        </BottomSheet.Title>

        <Button
          iconOnly
          variant="ghost"
          size="small"
          aria-label="내 픽 폴더 관리"
          onClick={() => {
            setMode("manage");
          }}
        >
          <SettingIcon />
        </Button>
      </BottomSheet.Header>

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
        <Button
          fullWidth
          isLoading={updateFolderMutation.isPending}
          onClick={handleSave}
        >
          저장
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
