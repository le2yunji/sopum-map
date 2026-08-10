"use client";

import { ShopDetailScreen } from "./_components/ShopDetailScreen";

type ShopDetailErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

/** 상점 상세 렌더링 실패를 복구 가능한 오류 화면으로 바꿉니다. */
export default function ShopDetailError({ reset }: ShopDetailErrorProps) {
  return <ShopDetailScreen state="error" onRetry={reset} />;
}
