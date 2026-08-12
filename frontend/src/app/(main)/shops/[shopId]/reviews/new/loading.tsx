import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 후기 작성 경로가 준비되는 동안 화면 높이를 유지합니다. */
export default function Loading() {
  return <main className="p-5"><Skeleton label="후기 작성 화면을 불러오는 중" className="h-24 rounded-xl" /></main>;
}
