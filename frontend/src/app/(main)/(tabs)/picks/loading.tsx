import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 내 픽 경로가 준비되는 동안 목록 구조를 유지합니다. */
export default function Loading() {
  return <main className="p-5 pt-16"><Skeleton label="내 픽을 불러오는 중" className="h-64 rounded-2xl" /></main>;
}
