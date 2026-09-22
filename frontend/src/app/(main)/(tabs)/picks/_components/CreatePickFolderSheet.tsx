"use client";

import { useState } from "react";

import { useCreatePickFolder } from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";

type PickFolder = Readonly<{
  id: string;
  title: string;
}>;

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: PickFolder[];
  onCreated: (folderId: string) => void;
}>;

export function CreatePickFolderSheet({
  open,
  onOpenChange,
  folders,
  onCreated,
}: Props) {
  const [folderName, setFolderName] = useState("");

  const createFolderMutation = useCreatePickFolder();

  const normalizedFolderName = folderName.trim();

  const isDuplicateFolder = folders.some(
    (folder) => folder.title === normalizedFolderName,
  );

  const reset = () => {
    setFolderName("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const handleSubmit = () => {
    if (
      !normalizedFolderName ||
      isDuplicateFolder ||
      createFolderMutation.isPending
    ) {
      return;
    }

    createFolderMutation.mutate(
      {
        title: normalizedFolderName,
      },
      {
        onSuccess: (folder) => {
          onCreated(folder.id);
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      ariaLabelledBy="new-folder-title"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <BottomSheet.Handle />

        <BottomSheet.Header>
          <BottomSheet.Title id="new-folder-title">
            새 폴더 만들기
          </BottomSheet.Title>
        </BottomSheet.Header>

        <BottomSheet.Body>
          <label htmlFor="new-folder-name" className="text-14 font-semibold">
            새 폴더 이름
          </label>

          <input
            id="new-folder-name"
            value={folderName}
            onChange={(event) => {
              setFolderName(event.target.value);
            }}
            maxLength={50}
            aria-invalid={isDuplicateFolder}
            aria-describedby={
              isDuplicateFolder ? "new-folder-error" : undefined
            }
            className="mt-2 min-h-12 w-full rounded-xl border border-black-300 px-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />

          {isDuplicateFolder ? (
            <p id="new-folder-error" className="mt-2 text-12 text-red-600">
              이미 사용 중인 폴더 이름이에요.
            </p>
          ) : null}
        </BottomSheet.Body>

        <BottomSheet.Footer>
          <Button
            type="submit"
            fullWidth
            isLoading={createFolderMutation.isPending}
            disabled={!normalizedFolderName || isDuplicateFolder}
          >
            폴더 만들기
          </Button>
        </BottomSheet.Footer>
      </form>
    </BottomSheet>
  );
}
