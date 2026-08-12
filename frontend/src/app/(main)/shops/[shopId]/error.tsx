"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button/Button";

/** 상점 상세 렌더링 오류를 해당 경로 안에서 복구합니다. */
export default function Error({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => console.error(error), [error]);

  return <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center"><h1 className="text-20 font-semibold">상점 정보를 불러오지 못했어요</h1><p className="mt-2 text-14 text-black-500">잠시 후 다시 시도해 주세요.</p><Button className="mt-6" onClick={unstable_retry}>다시 시도</Button></main>;
}
