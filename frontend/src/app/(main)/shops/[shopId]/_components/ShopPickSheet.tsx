"use client";

import { useState } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";

const PICK_FOLDERS = ["성수 나들이", "선물 후보", "꼭 가볼 곳"] as const;

type PickFolder = (typeof PICK_FOLDERS)[number];

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: (folder: PickFolder) => void;
}>;

export function ShopPickSheet({ open, onOpenChange, onAdded }: Props) {
  const [folder, setFolder] = useState<PickFolder | null>(null);

  const reset = () => {
    setFolder(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  };

  const handleAdd = () => {
    if (!folder) {
      return;
    }

    onAdded?.(folder);

    reset();
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      ariaLabelledBy="pick-title"
    >
      <BottomSheet.Handle />

      <BottomSheet.Header>
        <BottomSheet.Title id="pick-title">내 픽 폴더 선택</BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        <fieldset className="space-y-3">
          <legend className="sr-only">폴더 선택</legend>

          {PICK_FOLDERS.map((name) => (
            <label key={name} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="pick-folder"
                value={name}
                checked={folder === name}
                onChange={() => setFolder(name)}
              />

              <span>{name}</span>
            </label>
          ))}
        </fieldset>
      </BottomSheet.Body>

      <BottomSheet.Footer>
        <Button fullWidth disabled={!folder} onClick={handleAdd}>
          폴더에 담기
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
