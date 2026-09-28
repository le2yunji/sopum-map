"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  likedShopQueryKeys,
  pickFolderQueryKeys,
} from "@/api/pick-folder/pick-folder.query";
import { likeShop, unlikeShop } from "@/api/shops/shop-like.api";
import { shopQueryKeys } from "@/api/shops/shop.query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { PickFolderSheet } from "./PickFolderSheet";
import { PickSnackbar } from "./PickSnackbar";

type PickActionRenderProps = Readonly<{
  isLiked: boolean;
  isPending: boolean;
  onToggle: () => void;
}>;

type SnackbarType = "added" | "removed";

type Props = Readonly<{
  shopId: string;
  initialIsLiked?: boolean;

  children: (props: PickActionRenderProps) => ReactNode;

  /**
   * 별도 동작이 필요한 경우 기본 좋아요 API를 대체합니다.
   */
  onAdd?: (shopId: string) => void | Promise<void>;
  onRemove?: (shopId: string) => void | Promise<void>;
}>;

const SNACKBAR_DURATION = 3000;
const PICK_SYNC_DELAY = 300;

export function PickAction({
  shopId,
  initialIsLiked = false,
  children,
  onAdd,
  onRemove,
}: Props) {
  const queryClient = useQueryClient();

  /**
   * 현재 UI에 표시되는 좋아요 상태
   */
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  /**
   * 서버에 마지막으로 정상 반영된 상태
   */
  const [syncedIsLiked, setSyncedIsLiked] = useState(initialIsLiked);

  /**
   * 사용자의 입력이 멈춘 뒤 최종 상태
   */
  const debouncedIsLiked = useDebouncedValue(isLiked, PICK_SYNC_DELAY);

  /**
   * 실제 API 요청 진행 여부
   */
  const [isPending, setIsPending] = useState(false);

  const [snackbarType, setSnackbarType] = useState<SnackbarType | null>(null);

  const [isFolderSheetOpen, setFolderSheetOpen] = useState(false);

  /**
   * API 요청 도중에도 사용자가 다시 상태를 변경할 수 있으므로
   * 항상 최신 UI 상태를 보관합니다.
   */
  const latestIsLikedRef = useRef(initialIsLiked);

  useEffect(() => {
    latestIsLikedRef.current = isLiked;
  }, [isLiked]);

  /**
   * Snackbar 자동 종료
   */
  useEffect(() => {
    if (!snackbarType) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSnackbarType(null);
    }, SNACKBAR_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [snackbarType]);

  /**
   * debounce가 완료된 최종 상태를 서버에 반영합니다.
   */
  useEffect(() => {
    /**
     * 서버 상태와 같다면 API 호출이 필요 없습니다.
     */
    if (debouncedIsLiked === syncedIsLiked) {
      return;
    }

    /**
     * 기존 요청이 진행 중이면 기다립니다.
     */
    if (isPending) {
      return;
    }

    const targetIsLiked = debouncedIsLiked;

    const syncPickState = async () => {
      setIsPending(true);

      try {
        if (targetIsLiked) {
          if (onAdd) {
            await onAdd(shopId);
          } else {
            await likeShop(shopId);
          }
        } else {
          if (onRemove) {
            await onRemove(shopId);
          } else {
            await unlikeShop(shopId);
          }
        }

        /**
         * 서버에 정상 반영된 상태를 기록합니다.
         */
        setSyncedIsLiked(targetIsLiked);

        /**
         * 현재 요청이 최종 사용자 의도인 경우에만
         * Snackbar 및 Query 갱신을 수행합니다.
         */
        if (latestIsLikedRef.current === targetIsLiked) {
          setSnackbarType(targetIsLiked ? "added" : "removed");

          void queryClient.invalidateQueries({
            queryKey: shopQueryKeys.all,
          });

          void queryClient.invalidateQueries({
            queryKey: likedShopQueryKeys.all,
          });

          if (!targetIsLiked) {
            void queryClient.invalidateQueries({
              queryKey: pickFolderQueryKeys.all,
            });
          }
        }
      } catch (error) {
        /**
         * 현재 UI가 실패한 요청 상태를 그대로 유지하고 있다면
         * 마지막 서버 상태로 되돌립니다.
         */
        if (latestIsLikedRef.current === targetIsLiked) {
          setIsLiked(syncedIsLiked);
        }

        console.error("상점 픽 상태 변경 실패:", error);
      } finally {
        setIsPending(false);
      }
    };

    void syncPickState();
  }, [
    debouncedIsLiked,
    syncedIsLiked,
    isPending,
    shopId,
    onAdd,
    onRemove,
    queryClient,
  ]);

  /**
   * 클릭 시 API를 바로 호출하지 않고
   * UI 상태만 즉시 변경합니다.
   */
  const handleToggle = () => {
    setSnackbarType(null);

    setIsLiked((current) => !current);
  };

  /**
   * 현재 상점의 내 픽 폴더 선택 Sheet를 엽니다.
   */
  const handleOpenFolderSheet = () => {
    setSnackbarType(null);
    setFolderSheetOpen(true);
  };

  return (
    <>
      {children({
        isLiked,
        isPending,
        onToggle: handleToggle,
      })}

      <PickSnackbar
        open={snackbarType !== null}
        type={snackbarType ?? "added"}
        onChangeFolder={handleOpenFolderSheet}
      />

      <PickFolderSheet
        open={isFolderSheetOpen}
        shopId={shopId}
        onOpenChange={setFolderSheetOpen}
      />
    </>
  );
}
