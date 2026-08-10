"use client";

import { VisitLogFormScreen } from "./_components/VisitLogFormScreen";

/** 후기 작성 렌더링 실패를 다시 시도 가능한 화면으로 격리합니다. */
export default function VisitLogError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return <VisitLogFormScreen shopId="" shopName="" state="error" onRetry={reset} />;
}
