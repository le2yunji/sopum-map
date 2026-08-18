"use client";

import { useState } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";

import type { PickFolder } from "./pick.types";

const MOCK_PICK_FOLDERS: readonly PickFolder[] = [
  {
    id: "folder-seongsu",
    name: "성수 나들이",
  },
  {
    id: "folder-gift",
    name: "선물 후보",
  },
  {
    id: "folder-wishlist",
    name: "꼭 가볼 곳",
  },
];

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderChange?: (folder: PickFolder) => void;
}>;

export function PickFolderSheet({ open, onOpenChange, onFolderChange }: Props) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const reset = () => {
    setSelectedFolderId(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  };

  const handleChangeFolder = () => {
    if (!selectedFolderId) {
      return;
    }

    const selectedFolder = MOCK_PICK_FOLDERS.find(
      (folder) => folder.id === selectedFolderId,
    );

    if (!selectedFolder) {
      return;
    }

    onFolderChange?.(selectedFolder);

    reset();
    onOpenChange(false);
  };

  if (!open) {
    return null;
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      ariaLabelledBy="pick-folder-title"
    >
      <BottomSheet.Handle />

      <BottomSheet.Header>
        <BottomSheet.Title id="pick-folder-title">
          내 픽 폴더 선택
        </BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        <fieldset className="space-y-2">
          <legend className="sr-only">폴더 선택</legend>

          {MOCK_PICK_FOLDERS.map((folder) => {
            const isSelected = selectedFolderId === folder.id;

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
                  type="radio"
                  name="pick-folder"
                  value={folder.id}
                  checked={isSelected}
                  onChange={() => setSelectedFolderId(folder.id)}
                />

                <span className="text-14">{folder.name}</span>
              </label>
            );
          })}
        </fieldset>
      </BottomSheet.Body>

      <BottomSheet.Footer>
        <Button
          fullWidth
          disabled={!selectedFolderId}
          onClick={handleChangeFolder}
        >
          폴더 변경
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
