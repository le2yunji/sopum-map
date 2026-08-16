import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 상점 상세 레이아웃을 유지하는 로딩 화면입니다. */
export function ShopDetailSkeleton() {
  return (
    <main aria-busy="true">
      <Skeleton label="상점 정보를 불러오는 중" className="h-[318px]" />

      <div className="space-y-3 p-5">
        <Skeleton announce={false} className="h-7 w-40 rounded" />

        <Skeleton announce={false} className="h-4 w-56 rounded" />

        <Skeleton announce={false} className="h-44 rounded-xl" />
      </div>
    </main>
  );
}
