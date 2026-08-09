"use client";

import { Button } from "@/components/ui/Button";

/** 지도 경로 오류를 앱 전체와 분리해 복구 동작을 제공합니다. */
export default function MapError({ unstable_retry }: { error: Error; unstable_retry: () => void }) {
  return <div role="alert" className="grid h-[calc(100dvh-65px)] place-items-center px-8 text-center"><div><h1 className="text-20 font-semibold">지도 화면을 열지 못했어요</h1><p className="mt-2 text-14 text-black-500">다른 화면은 계속 이용할 수 있어요</p><Button className="mt-5" onClick={unstable_retry}>다시 시도</Button></div></div>;
}
