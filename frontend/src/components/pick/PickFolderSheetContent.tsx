"use client";

import { Fragment, useState } from "react";
import type { PickFolderListItem } from "@sopum-map/shared";

import { useUpdateFolderIdsByShop } from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";
import { getPickFolderErrorMessage } from "@/app/(main)/(tabs)/picks/_components/picks-ui";
import { CheckIcon } from "../icons";

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
      <BottomSheet.Body className="min-h-0 flex-1 overflow-y-auto">
        {folders.length === 0 ? (
          <p className="px-3 py-4 text-14 text-black-500">
            생성된 내 픽 폴더가 없습니다.
          </p>
        ) : (
          <fieldset>
            <legend className="sr-only">폴더 선택</legend>

            {folders.map((folder, index) => {
              const isSelected = selectedFolderIds.includes(folder.id);
              const hasSeparator = index < folders.length - 1;

              return (
                <Fragment key={folder.id}>
                  <label
                    className={[
                      "flex min-h-11 cursor-pointer",
                      "items-center gap-3 rounded-control px-3",
                    ].join(" ")}
                  >
                    <span className="relative shrink-0">
                      <input
                        type="checkbox"
                        value={folder.id}
                        checked={isSelected}
                        onChange={() => {
                          handleToggleFolder(folder.id);
                        }}
                        className="peer sr-only"
                      />

                      <span
                        aria-hidden="true"
                        className={[
                          "grid size-5 place-items-center rounded border",
                          "transition-colors",
                          "peer-focus-visible:ring-2",
                          "peer-focus-visible:ring-green-500",
                          "peer-focus-visible:ring-offset-2",
                          isSelected
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-black-300 bg-white text-transparent",
                        ].join(" ")}
                      >
                        <CheckIcon className="size-4" />
                      </span>
                    </span>

                    <span className="flex-1 text-14">{folder.title}</span>

                    <span className="text-12 text-black-500">
                      {folder.shopCount}
                    </span>
                  </label>

                  {hasSeparator ? (
                    <hr className="mx-3 mt-2 h-px border-0 bg-black-100/50" />
                  ) : null}
                </Fragment>
              );
            })}
          </fieldset>
        )}
      </BottomSheet.Body>

      <BottomSheet.Footer className="shrink-0 flex-col">
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
