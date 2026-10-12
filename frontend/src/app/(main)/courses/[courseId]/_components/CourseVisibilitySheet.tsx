"use client";

import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";

type Props = Readonly<{
  open: boolean;
  isPublic: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}>;

/** 공개 상태 변경의 영향을 확인한 뒤 실행하게 합니다. */
export function CourseVisibilitySheet({
  open,
  isPublic,
  isPending,
  onOpenChange,
  onConfirm,
}: Props) {
  const nextLabel = isPublic ? "비공개" : "공개";

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="course-visibility-title"
    >
      <BottomSheet.Handle />
      <BottomSheet.Header>
        <BottomSheet.Title id="course-visibility-title">
          코스를 {nextLabel}로 바꿀까요?
        </BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body>
        <p className="text-14 text-black-500">
          {isPublic
            ? "비공개로 바꾸면 다른 사용자는 상세 내용을 볼 수 없어요."
            : "공개로 바꾸면 다른 사용자도 코스를 볼 수 있어요."}
        </p>
      </BottomSheet.Body>
      <BottomSheet.Footer className="gap-2">
        <Button
          variant="outline"
          fullWidth
          className="min-w-0 flex-1 shrink"
          disabled={isPending}
          onClick={() => onOpenChange(false)}
        >
          취소
        </Button>
        <Button
          fullWidth
          className="min-w-0 flex-1 shrink"
          isLoading={isPending}
          disabled={isPending}
          onClick={onConfirm}
        >
          {nextLabel}로 변경
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
