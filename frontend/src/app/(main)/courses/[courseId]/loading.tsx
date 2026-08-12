import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
/** 코스 경로가 준비되는 동안 화면 크기를 유지합니다. */
export default function Loading() { return <main className="p-6 pt-16"><Skeleton label="코스를 불러오는 중" className="h-[70dvh] rounded-2xl" /></main>; }
