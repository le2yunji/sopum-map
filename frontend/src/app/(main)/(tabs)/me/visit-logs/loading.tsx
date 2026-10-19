import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 내 방문 로그 화면의 최종 카드 크기를 유지하는 로딩 상태입니다. */
export default function MyVisitLogsLoading() { return <main className="min-h-dvh px-5 pt-10"><Skeleton label="내 방문 로그를 불러오는 중" className="h-8 w-40" /><Skeleton announce={false} className="mt-5 h-24 rounded-card" /><Skeleton announce={false} className="mt-4 h-52 rounded-card" /></main>; }
