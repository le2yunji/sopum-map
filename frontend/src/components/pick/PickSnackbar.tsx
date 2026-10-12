"use client";

import { ChevronRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Snackbar } from "@/components/ui/Snackbar";

type PickSnackbarType = "added" | "removed";

type Props = Readonly<{
  open: boolean;
  type: PickSnackbarType;
  onChangeFolder: () => void;
}>;

export function PickSnackbar({ open, type, onChangeFolder }: Props) {
  const isAdded = type === "added";

  return (
    <Snackbar
      open={open}
      message={
        isAdded ? "🍀 내 픽에 저장되었습니다" : "내 픽에서 삭제되었습니다"
      }
      action={
        isAdded ? (
          <Button
            variant="ghost"
            size="small"
            onClick={onChangeFolder}
            rightIcon={<ChevronRightIcon className="size-4!" />}
            className="
              h-auto! min-h-0!
              shrink-0
              gap-0.5!
              px-0!
              py-1
              text-12 font-semibold! text-white!
              hover:bg-transparent!
            "
          >
            폴더 변경
          </Button>
        ) : undefined
      }
    />
  );
}
