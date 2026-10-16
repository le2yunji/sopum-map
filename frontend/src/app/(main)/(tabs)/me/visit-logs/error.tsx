"use client";

import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

/** 예상하지 못한 렌더링 오류에서도 다시 시도할 수 있게 합니다. */
export default function MyVisitLogsError({ reset }: Readonly<{ reset: () => void }>) { return <StatePanel title="방문 로그 화면을 열지 못했어요" action="다시 시도" onAction={reset} />; }
