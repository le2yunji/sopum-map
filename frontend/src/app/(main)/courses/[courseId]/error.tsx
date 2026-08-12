"use client";
import { Button } from "@/components/ui/Button/Button";
/** 코스 상세 오류를 페이지 안에서 복구할 수 있게 합니다. */
export default function Error({ unstable_retry }: { unstable_retry: () => void }) { return <main className="grid min-h-[70dvh] place-items-center px-6 text-center"><div><h1 className="text-20 font-semibold">코스를 불러오지 못했습니다.</h1><Button className="mt-5" onClick={unstable_retry}>다시 시도</Button></div></main>; }
