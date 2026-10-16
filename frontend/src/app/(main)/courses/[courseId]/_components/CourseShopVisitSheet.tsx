"use client";

import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";

type Props = Readonly<{
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordOnly: () => void;
  onWriteLog: () => void;
}>;

/** 방문 체크 뒤 공개 로그 작성 여부를 선택하게 합니다. */
export function CourseShopVisitSheet({
  open,
  isPending,
  onOpenChange,
  onRecordOnly,
  onWriteLog,
}: Props) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="course-shop-visit-title"
      ariaDescribedBy="course-shop-visit-description"
    >
      <BottomSheet.Handle />
      <BottomSheet.Header>
        <BottomSheet.Title id="course-shop-visit-title">
          방문 로그를 작성하시겠어요?
        </BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body>
        <p id="course-shop-visit-description" className="text-14 text-black-500">
          방문만 기록하거나, 사진과 태그를 남길 수 있어요.
        </p>
      </BottomSheet.Body>
      <BottomSheet.Footer className="gap-2">
        <Button
          variant="outline"
          fullWidth
          className="min-w-0 flex-1 shrink"
          disabled={isPending}
          onClick={onRecordOnly}
        >
          방문만 기록
        </Button>
        <Button
          fullWidth
          className="min-w-0 flex-1 shrink"
          isLoading={isPending}
          disabled={isPending}
          onClick={onWriteLog}
        >
          로그 작성하기
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
