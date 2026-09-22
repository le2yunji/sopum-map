"use client";

import {
  useFolderIdsByShop,
  usePickFolders,
} from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";

import { PickFolderSheetContent } from "./PickFolderSheetContent";

type Props = Readonly<{
  open: boolean;
  shopId: string;
  onOpenChange: (open: boolean) => void;
}>;

export function PickFolderSheet({ open, shopId, onOpenChange }: Props) {
  const { data: folderData, isPending: isFolderPending } = usePickFolders();

  const { data: shopFolderData, isPending: isShopFolderPending } =
    useFolderIdsByShop(shopId);

  if (!open) {
    return null;
  }

  const isPending = isFolderPending || isShopFolderPending;

  if (isPending) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        ariaLabelledBy="pick-folder-title"
      >
        <BottomSheet.Handle />

        <BottomSheet.Header>
          <BottomSheet.Title id="pick-folder-title">
            내 픽 폴더 선택
          </BottomSheet.Title>
        </BottomSheet.Header>

        <BottomSheet.Body>
          <p className="px-3 py-4 text-14 text-black-500">
            폴더를 불러오는 중입니다.
          </p>
        </BottomSheet.Body>
      </BottomSheet>
    );
  }

  return (
    <PickFolderSheetContent
      key={shopId}
      shopId={shopId}
      folders={folderData?.items ?? []}
      initialFolderIds={shopFolderData?.folderIds ?? []}
      onOpenChange={onOpenChange}
    />
  );
}
