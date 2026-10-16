"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { CourseShopVisitSheet } from "./CourseShopVisitSheet";

type Props = Readonly<{
  isVisited: boolean;
  isPending: boolean;
  onSetVisited: () => Promise<void>;
  onUnsetVisited: () => Promise<void>;
  onWriteLog: () => void;
  onError: () => void;
}>;

/** 코스 상점의 방문 상태와 선택형 로그 작성 흐름을 한곳에서 제어합니다. */
export function CourseShopVisitButton({
  isVisited,
  isPending,
  onSetVisited,
  onUnsetVisited,
  onWriteLog,
  onError,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  /** 방문 상태 저장 뒤 필요하면 다음 행동을 실행합니다. */
  const recordVisit = async (nextAction?: () => void) => {
    try {
      await onSetVisited();
      setSheetOpen(false);
      nextAction?.();
    } catch {
      onError();
    }
  };

  /** 활성 방문 상태는 확인창 없이 해제합니다. */
  const handleButtonClick = async () => {
    if (!isVisited) {
      setSheetOpen(true);
      return;
    }

    try {
      await onUnsetVisited();
    } catch {
      onError();
    }
  };

  return (
    <>
      <Button
        variant={isVisited ? "secondary" : "outline"}
        size="small"
        aria-label={isVisited ? "방문 완료" : "방문했어요"}
        aria-pressed={isVisited}
        isLoading={isPending}
        disabled={isPending}
        className="mt-3"
        onClick={() => void handleButtonClick()}
      >
        {isVisited ? "✓ 방문 완료" : "방문했어요"}
      </Button>
      <CourseShopVisitSheet
        open={sheetOpen}
        isPending={isPending}
        onOpenChange={setSheetOpen}
        onRecordOnly={() => void recordVisit()}
        onWriteLog={() => void recordVisit(onWriteLog)}
      />
    </>
  );
}
