"use client";

import { Button } from "@/components/ui/Button";
import { ChevronRightIcon } from "../icons";

type PickSnackbarType = "added" | "removed";

type Props = Readonly<{
  open: boolean;
  type: PickSnackbarType;
  onChangeFolder: () => void;
}>;

export function PickSnackbar({ open, type, onChangeFolder }: Props) {
  if (!open) {
    return null;
  }

  const isAdded = type === "added";

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed inset-x-4 bottom-20 z-60
        mx-auto flex max-w-[440px]
        items-center justify-between gap-3
        rounded-lg bg-black-950
        h-12 px-4 py-3
        shadow-lg
      "
    >
      <p className="text-13 text-white">
        {isAdded ? "🍀 내 픽에 저장되었습니다" : "내 픽에서 삭제되었습니다"}
      </p>

      {isAdded ? (
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
      ) : null}
    </div>
  );
}
