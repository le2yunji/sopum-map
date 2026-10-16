"use client";

import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

/** 수정 화면 오류를 목록 이동으로 복구할 수 있게 합니다. */
export default function VisitLogEditError() { return <StatePanel title="방문 로그 수정 화면을 열지 못했어요" action="내 방문 로그로 이동" actionHref="/me/visit-logs" />; }
