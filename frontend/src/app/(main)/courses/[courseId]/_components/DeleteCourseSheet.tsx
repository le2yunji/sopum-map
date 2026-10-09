"use client";

import { Button } from "@/components/ui/Button";

type Props = Readonly<{
  open: boolean;
  isPending: boolean;

  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}>;

export function DeleteCourseSheet({
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-70 flex items-end bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-course-title"
        className="
          w-full rounded-t-2xl bg-white
          px-5 pb-8 pt-6
        "
      >
        <h2 id="delete-course-title" className="text-18 font-semibold">
          코스를 삭제할까요?
        </h2>

        <p className="mt-2 text-14 text-black-500">
          삭제한 코스는 다시 복구할 수 없어요.
        </p>

        <div className="mt-6 flex gap-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            disabled={isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            취소
          </Button>

          <Button
            type="button"
            fullWidth
            isLoading={isPending}
            disabled={isPending}
            onClick={onConfirm}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
