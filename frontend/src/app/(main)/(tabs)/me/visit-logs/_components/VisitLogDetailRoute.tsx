"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useDeleteVisitLog,
  useMyVisitLog,
} from "@/api/visit-log/visit-log.query";

import { VisitLogDetailStateView } from "./VisitLogDetailStateView";
import { VisitLogDetailView } from "./VisitLogDetailView";

type Props = Readonly<{
  visitLogId: string;
  mode: "page" | "modal";
}>;

/** 상세 조회와 삭제 결과를 현재 라우트 표현 방식에 연결합니다. */
export function VisitLogDetailRoute({ visitLogId, mode }: Props) {
  const router = useRouter();
  const query = useMyVisitLog(visitLogId);
  const deleteMutation = useDeleteVisitLog();
  const [deleteError, setDeleteError] = useState<string>();

  /** 모달은 이전 피드로, 단독 페이지는 방문 로그 목록으로 이동합니다. */
  const closeDetail = () => {
    if (mode === "modal") {
      router.back();
      return;
    }

    router.replace("/me/visit-logs");
  };

  /** 사용자가 확인한 경우에만 방문 로그 삭제를 요청합니다. */
  const handleConfirmDelete = () => {
    setDeleteError(undefined);

    deleteMutation.mutate(visitLogId, {
      onSuccess: closeDetail,
      onError: () => {
        setDeleteError("삭제하지 못했습니다. 다시 시도해 주세요.");
      },
    });
  };

  if (query.isPending) {
    return (
      <VisitLogDetailStateView
        mode={mode}
        status="loading"
        onClose={closeDetail}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  if (query.isError) {
    return (
      <VisitLogDetailStateView
        mode={mode}
        status="error"
        onClose={closeDetail}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  return (
    <VisitLogDetailView
      mode={mode}
      visitLog={query.data}
      onClose={closeDetail}
      onConfirmDelete={handleConfirmDelete}
      isDeleting={deleteMutation.isPending}
      deleteError={deleteError}
    />
  );
}
