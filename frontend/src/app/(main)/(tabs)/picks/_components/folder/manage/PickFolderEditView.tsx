"use client";

import { useState } from "react";

import {
  useInfiniteShopsByFolder,
  useRemoveShopFromFolder,
  useUpdatePickFolder,
} from "@/api/pick-folder/pick-folder.query";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

type Props = Readonly<{
  folderId: string;
  title: string;
  onBack: () => void;
}>;

export function PickFolderEditView({ folderId, title, onBack }: Props) {
  const [draftTitle, setDraftTitle] = useState(title);

  const updateFolderMutation = useUpdatePickFolder(folderId);

  const removeShopMutation = useRemoveShopFromFolder(folderId);

  const shopsQuery = useInfiniteShopsByFolder(folderId, 20);

  const shops = shopsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const normalizedTitle = draftTitle.trim();

  const isTitleChanged =
    normalizedTitle.length > 0 && normalizedTitle !== title;

  const handleUpdateTitle = () => {
    if (!isTitleChanged || updateFolderMutation.isPending) {
      return;
    }

    updateFolderMutation.mutate({
      title: normalizedTitle,
    });
  };

  const handleRemoveShop = (shopId: string) => {
    if (removeShopMutation.isPending) {
      return;
    }

    removeShopMutation.mutate(shopId);
  };

  return (
    <div>
      <div>
        <label
          htmlFor="pick-folder-edit-title"
          className="text-13 font-medium text-black-700"
        >
          폴더 이름
        </label>

        <div className="mt-2 flex gap-2">
          <input
            id="pick-folder-edit-title"
            value={draftTitle}
            maxLength={50}
            onChange={(event) => {
              setDraftTitle(event.target.value);
            }}
            className="
              min-h-11 min-w-0 flex-1 rounded-lg
              border border-black-300 px-3
              text-14 outline-none
              focus:border-green-500
              focus:ring-2 focus:ring-green-500/20
            "
          />

          <Button
            size="small"
            isLoading={updateFolderMutation.isPending}
            disabled={!isTitleChanged}
            onClick={handleUpdateTitle}
          >
            변경
          </Button>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <h3 className="text-14 font-semibold">폴더에 담긴 상점</h3>

          <span className="text-12 text-black-500">{shops.length}</span>
        </div>

        {shopsQuery.isPending ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton announce={false} className="h-12 rounded-xl" />
          </div>
        ) : shops.length === 0 ? (
          <p className="mt-3 py-4 text-13 text-black-500">
            폴더에 담긴 상점이 없습니다.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-black-100">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex min-h-13 items-center gap-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-14 font-medium">
                    {shop.name}
                  </div>

                  <div className="mt-0.5 text-12 text-black-500">
                    {shop.regionGroup}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="small"
                  disabled={removeShopMutation.isPending}
                  onClick={() => {
                    handleRemoveShop(shop.id);
                  }}
                  className="min-h-9 px-2.5 text-red-600"
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button variant="secondary" fullWidth onClick={onBack}>
          완료
        </Button>
      </div>
    </div>
  );
}
