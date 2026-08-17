"use client";

import { Button } from "@/components/ui/Button/Button";

/** 후기 작성 경로의 예상하지 못한 오류를 다시 시도할 수 있게 합니다. */
export default function Error({ unstable_retry }: { unstable_retry: () => void }) {
  return <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center"><h1 className="text-20 font-semibold">후기 작성 화면을 불러오지 못했어요</h1><Button className="mt-5" onClick={unstable_retry}>다시 시도</Button></main>;
}
