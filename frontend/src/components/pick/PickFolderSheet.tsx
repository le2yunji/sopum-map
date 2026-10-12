"use client";

import {
  useFolderIdsByShop,
  usePickFolders,
} from "@/api/pick-folder/pick-folder.query";
import { isApiError } from "@sopum-map/shared";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";

import { PickFolderSheetContent } from "./PickFolderSheetContent";
import { getPickFolderErrorMessage } from "@/app/(main)/(tabs)/picks/_components/picks-ui";

type Props = Readonly<{
  open: boolean;
  shopId: string;
  onOpenChange: (open: boolean) => void;
}>;

export function PickFolderSheet({ open, shopId, onOpenChange }: Props) {
  const { data: folderData, isPending: isFolderPending, error: folderError } = usePickFolders();

  const { data: shopFolderData, isPending: isShopFolderPending, error: shopFolderError } =
    useFolderIdsByShop(shopId, open);

  if (!open) {
    return null;
  }

  const isPending = isFolderPending || isShopFolderPending;
  const error = folderError ?? shopFolderError;
  const isUnauthorized = isApiError(error) && error.status === 401;

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

      {error ? (
        <BottomSheet.Body>
          <p role="alert" className="px-3 py-4 text-14 text-red-600">
            {getPickFolderErrorMessage(error)}
          </p>
          {isUnauthorized ? (
            <a href="/login" className="px-3 text-13 font-semibold text-green-700">
              로그인 화면으로 이동
            </a>
          ) : null}
        </BottomSheet.Body>
      ) : isPending ? (
        <BottomSheet.Body>
          <p className="px-3 py-4 text-14 text-black-500">
            폴더를 불러오는 중입니다.
          </p>
        </BottomSheet.Body>
      ) : (
        <PickFolderSheetContent
          shopId={shopId}
          folders={folderData?.items ?? []}
          initialFolderIds={shopFolderData?.folderIds ?? []}
          onOpenChange={onOpenChange}
        />
      )}
    </BottomSheet>
  );
}
