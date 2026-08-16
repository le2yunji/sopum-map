import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 지도 경로가 준비되는 동안 화면 뼈대를 표시합니다. */
export default function MapLoading() {
  return (
    <div
      role="status"
      aria-label="지도 화면을 불러오는 중"
      className="h-[calc(100dvh-65px)] bg-green-50 p-4"
    >
      <Skeleton className="h-11 w-full rounded-full" />
      <Skeleton className="mt-3 h-10 w-4/5 rounded-full" />
      <Skeleton className="mt-[360px] h-56 w-full rounded-t-3xl" />
    </div>
  );
}
