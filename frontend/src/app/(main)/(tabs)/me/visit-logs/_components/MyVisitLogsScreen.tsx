"use client";

import type { MyVisitLogListItem } from "@sopum-map/shared";
import Link from "next/link";
import { useState } from "react";

import { useDeleteVisitLog, useInfiniteMyVisitLogs } from "@/api/visit-log/visit-log.query";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button/Button";
import { Snackbar } from "@/components/ui/Snackbar";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { MyVisitLogCard } from "./MyVisitLogCard";

/** 내 방문 로그의 목록·페이지 추가 조회·삭제 확인을 한 흐름으로 관리합니다. */
export function MyVisitLogsScreen() {
  const query = useInfiniteMyVisitLogs();
  const deleteMutation = useDeleteVisitLog();
  const [deleteTarget, setDeleteTarget] = useState<MyVisitLogListItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const summary = query.data?.pages[0]?.summary;
  const { loadMoreRef } = useInfiniteScroll({ onLoadMore: () => void query.fetchNextPage(), hasNextPage: Boolean(query.hasNextPage), isLoading: query.isFetchingNextPage });

  /** 확인된 로그만 삭제하고 서버 목록을 다시 불러옵니다. */
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => { setDeleteTarget(null); setNotice("방문 로그를 삭제했어요."); } });
  };

  if (query.isPending) return <div role="status" className="min-h-dvh px-5 pt-16 text-center text-14 text-black-500">방문 로그를 불러오는 중...</div>;
  if (query.isError) return <StatePanel title="방문 로그를 불러오지 못했어요" action="다시 시도" onAction={() => void query.refetch()} />;

  return (
    <main className="min-h-dvh bg-black-100/40 px-5 pb-28 pt-10">
      <header><p className="text-12 text-green-700">나의 기록</p><div className="mt-1 flex items-center justify-between gap-3"><h1 className="text-24 font-semibold">내 방문 로그</h1><Link href="/visit-logs/new" className="inline-flex min-h-11 items-center rounded-control bg-green-500 px-4 text-13 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">새 기록</Link></div></header>
      <section aria-label="방문 로그 요약" className="mt-5 grid grid-cols-2 gap-2 rounded-card bg-green-50 p-4 text-center"><div><p className="text-20 font-semibold text-green-700">{summary?.totalCount ?? 0}</p><p className="mt-1 text-12 text-black-500">쌓인 로그</p></div><div><p className="text-20 font-semibold text-green-700">{summary?.uniqueShopCount ?? 0}</p><p className="mt-1 text-12 text-black-500">방문한 상점</p></div></section>
      {items.length === 0 ? <div className="mt-12"><StatePanel title="아직 방문 로그가 없어요" description="다녀온 소품샵을 나만의 기록으로 남겨보세요." action="첫 로그 기록하기" actionHref="/visit-logs/new" /></div> : <section aria-label="내 방문 로그 목록" className="mt-5 space-y-3">{items.map((item) => <MyVisitLogCard key={item.id} visitLog={item} onDelete={setDeleteTarget} />)}</section>}
      {query.hasNextPage ? <div ref={loadMoreRef} className="h-8" aria-hidden="true" /> : null}
      {query.isFetchingNextPage ? <p role="status" className="py-4 text-center text-13 text-black-500">방문 로그를 더 불러오는 중...</p> : null}
      <BottomSheet open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)} ariaLabelledBy="delete-visit-log-title"><BottomSheet.Handle /><BottomSheet.Header><BottomSheet.Title id="delete-visit-log-title">방문 로그를 삭제할까요?</BottomSheet.Title></BottomSheet.Header><BottomSheet.Body><p className="text-14 text-black-500">삭제한 로그는 목록과 상점 상세에서 보이지 않아요.</p></BottomSheet.Body><BottomSheet.Footer className="gap-2"><Button fullWidth variant="outline" disabled={deleteMutation.isPending} onClick={() => setDeleteTarget(null)}>취소</Button><Button fullWidth isLoading={deleteMutation.isPending} onClick={handleDelete}>삭제</Button></BottomSheet.Footer>{deleteMutation.isError ? <p role="alert" className="mt-3 text-12 text-red-500">삭제하지 못했어요. 다시 시도해 주세요.</p> : null}</BottomSheet>
      <Snackbar open={notice !== null} message={notice ?? ""} />
    </main>
  );
}
