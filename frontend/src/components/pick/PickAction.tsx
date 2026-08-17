"use client";

import { useEffect, useState, type ReactNode } from "react";

import { PickFolderSheet } from "./PickFolderSheet";
import { PickSnackbar } from "./PickSnackbar";

import type { PickFolder } from "./pick.types";

type PickActionRenderProps = Readonly<{
  isPicked: boolean;
  onToggle: () => void;
}>;

type SnackbarType = "added" | "removed";

type Props = Readonly<{
  shopId: string;
  initialIsPicked?: boolean;

  children: (props: PickActionRenderProps) => ReactNode;

  onAdd?: (shopId: string) => void | Promise<void>;
  onRemove?: (shopId: string) => void | Promise<void>;

  onFolderChange?: (shopId: string, folder: PickFolder) => void | Promise<void>;
}>;

const SNACKBAR_DURATION = 3000;

export function PickAction({
  shopId,
  initialIsPicked = false,
  children,
  onAdd,
  onRemove,
  onFolderChange,
}: Props) {
  const [isPicked, setIsPicked] = useState(initialIsPicked);

  const [snackbarType, setSnackbarType] = useState<SnackbarType | null>(null);

  const [isFolderSheetOpen, setFolderSheetOpen] = useState(false);

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

  const handleToggle = async () => {
    if (isPicked) {
      await onRemove?.(shopId);

      setIsPicked(false);
      setSnackbarType("removed");

      return;
    }

    await onAdd?.(shopId);

    setIsPicked(true);
    setSnackbarType("added");
  };

  const handleOpenFolderSheet = () => {
    setSnackbarType(null);
    setFolderSheetOpen(true);
  };

  const handleFolderChange = async (folder: PickFolder) => {
    await onFolderChange?.(shopId, folder);
  };

  return (
    <>
      {children({
        isPicked,
        onToggle: handleToggle,
      })}

      <PickSnackbar
        open={snackbarType !== null}
        type={snackbarType ?? "added"}
        onChangeFolder={handleOpenFolderSheet}
      />

      <PickFolderSheet
        open={isFolderSheetOpen}
        onOpenChange={setFolderSheetOpen}
        onFolderChange={handleFolderChange}
      />
    </>
  );
}
