import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 방문 로그 수정 폼의 배치를 유지하는 로딩 상태입니다. */
export default function VisitLogEditLoading() { return <main className="min-h-dvh px-5 pt-10"><Skeleton label="방문 로그 수정 화면을 불러오는 중" className="h-8 w-40" /><Skeleton announce={false} className="mt-5 h-28 rounded-2xl" /><Skeleton announce={false} className="mt-4 h-96 rounded-2xl" /></main>; }
