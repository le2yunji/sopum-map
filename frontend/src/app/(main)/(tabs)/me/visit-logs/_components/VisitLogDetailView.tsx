"use client";

import type { MyVisitLogListItem } from "@sopum-map/shared";
import { useState } from "react";

import { ChevronLeftIcon } from "@/components/icons";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button/Button";

import { VisitLogDetailContent } from "./VisitLogDetailContent";
import { VisitLogDetailModal } from "./VisitLogDetailModal";

type Props = Readonly<{
  mode: "page" | "modal";
  visitLog: MyVisitLogListItem;
  onClose: () => void;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
  deleteError?: string;
}>;

/** 라우트 종류에 맞는 상세 껍데기와 삭제 확인 UI를 조합합니다. */
export function VisitLogDetailView({
  mode,
  visitLog,
  onClose,
  onConfirmDelete,
  isDeleting = false,
  deleteError,
}: Props) {
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

  /** 삭제 버튼의 첫 클릭은 실제 요청 대신 확인 단계를 엽니다. */
  const requestDelete = () => setIsDeleteSheetOpen(true);

  return (
    <>
      {mode === "modal" ? (
        <VisitLogDetailModal
          open
          visitLog={visitLog}
          onOpenChange={(open) => {
            if (!open) {
              onClose();
            }
          }}
          onDelete={requestDelete}
          isDeleting={isDeleting}
        />
      ) : (
        <main className="min-h-dvh bg-white pb-24">
          <header className="sticky top-0 z-20 flex min-h-14 items-center gap-1 border-b border-black-100 bg-white/95 px-3 backdrop-blur-sm">
            <Button
              iconOnly
              size="small"
              variant="ghost"
              aria-label="방문 로그 목록으로 이동"
              onClick={onClose}
            >
              <ChevronLeftIcon />
            </Button>

            <h1 className="text-16 font-semibold">방문 로그</h1>
          </header>

          <VisitLogDetailContent
            visitLog={visitLog}
            onDelete={requestDelete}
            isDeleting={isDeleting}
          />
        </main>
      )}

      <BottomSheet
        open={isDeleteSheetOpen}
        onOpenChange={setIsDeleteSheetOpen}
        ariaLabelledBy="delete-visit-log-title"
      >
        <BottomSheet.Handle />
        <BottomSheet.Header>
          <BottomSheet.Title id="delete-visit-log-title">
            방문 로그를 삭제할까요?
          </BottomSheet.Title>
        </BottomSheet.Header>
        <BottomSheet.Body>
          <p className="text-14 text-black-500">
            삭제한 로그는 목록과 상점 상세에서 보이지 않습니다.
          </p>

          {deleteError ? (
            <p role="alert" className="mt-3 text-12 text-red-600">
              {deleteError}
            </p>
          ) : null}
        </BottomSheet.Body>
        <BottomSheet.Footer className="gap-2">
          <Button
            fullWidth
            variant="outline"
            disabled={isDeleting}
            onClick={() => setIsDeleteSheetOpen(false)}
          >
            취소
          </Button>
          <Button fullWidth isLoading={isDeleting} onClick={onConfirmDelete}>
            삭제
          </Button>
        </BottomSheet.Footer>
      </BottomSheet>
    </>
  );
}
