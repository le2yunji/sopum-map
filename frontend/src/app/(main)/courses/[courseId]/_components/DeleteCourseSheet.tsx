"use client";

import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";

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
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="delete-course-title"
    >
      <BottomSheet.Handle />
      <BottomSheet.Header>
        <BottomSheet.Title id="delete-course-title">
          코스를 삭제할까요?
        </BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body>
        <p className="mt-2 text-14 text-black-500">
          삭제한 코스는 다시 복구할 수 없어요.
        </p>
      </BottomSheet.Body>
      <BottomSheet.Footer className="gap-2">
        <Button
          type="button"
          className="min-w-0 flex-1 shrink"
          variant="outline"
          fullWidth
          disabled={isPending}
          onClick={() => onOpenChange(false)}
        >
          취소
        </Button>
        <Button
          type="button"
          className="min-w-0 flex-1 shrink"
          fullWidth
          isLoading={isPending}
          disabled={isPending}
          onClick={onConfirm}
        >
          삭제
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
