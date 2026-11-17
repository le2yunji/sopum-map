"use client";

import type { MyVisitLogListItem } from "@sopum-map/shared";
import type { ReactNode } from "react";

import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";
import { useDialogOverlay } from "@/components/ui/overlay/useDialogOverlay";

import { VisitLogDetailContent } from "./VisitLogDetailContent";

type ModalShellProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}>;

type Props = Readonly<{
  open: boolean;
  visitLog: MyVisitLogListItem;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting?: boolean;
}>;

/** 상세 콘텐츠와 상태 화면에 같은 전체 높이 모달 틀을 제공합니다. */
export function VisitLogDetailModalShell({
  open,
  onOpenChange,
  children,
}: ModalShellProps) {
  const {
    dialogRef,
    visualState,
    handleCancel,
    handleKeyDown,
    handleBackdropClick,
  } = useDialogOverlay({
    open,
    onOpenChange,
    closeOnBackdrop: true,
  });
  const isVisible = visualState === "opening" || visualState === "open";

  return (
    <dialog
      ref={dialogRef}
      aria-label="방문 로그 상세"
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className={`fixed inset-x-0 bottom-0 top-4 m-0 h-[calc(100dvh-1rem)] max-h-none w-screen min-w-[100vw] max-w-none overflow-hidden rounded-card-lg rounded-b-none border border-b-0 border-white/40 bg-transparent p-0 shadow-floating backdrop:bg-black/45 min-[361px]:inset-0 min-[361px]:m-auto min-[361px]:h-[calc(100dvh-1.5rem)] min-[361px]:max-h-[840px] min-[361px]:w-[calc(100%-1.5rem)] min-[361px]:min-w-0 min-[361px]:max-w-[456px] min-[361px]:rounded-b-card-lg min-[361px]:border-b ${
        isVisible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-200 motion-reduce:transition-none`}
    >
      <div
        className={`flex h-full flex-col overflow-hidden rounded-card-lg rounded-b-none bg-white min-[361px]:rounded-b-card-lg ${
          isVisible
            ? "translate-y-0 scale-100"
            : "translate-y-2 scale-[0.98]"
        } transition-transform duration-200 motion-reduce:transition-none`}
      >
        <header className="sticky top-0 z-20 flex min-h-14 shrink-0 items-center justify-between border-b border-black-100 bg-white/95 px-3 backdrop-blur-sm">
          <h1
            tabIndex={-1}
            autoFocus
            className="pl-2 text-16 font-semibold focus:outline-none"
          >
            방문 로그
          </h1>

          <Button
            iconOnly
            size="small"
            variant="ghost"
            aria-label="방문 로그 상세 닫기"
            onClick={() => onOpenChange(false)}
          >
            <CloseIcon />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </dialog>
  );
}

/** 방문 로그 상세를 현재 피드 위에 전체 높이 모달로 표시합니다. */
export function VisitLogDetailModal({
  open,
  visitLog,
  onOpenChange,
  onDelete,
  isDeleting = false,
}: Props) {
  return (
    <VisitLogDetailModalShell open={open} onOpenChange={onOpenChange}>
      <VisitLogDetailContent
        visitLog={visitLog}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </VisitLogDetailModalShell>
  );
}
