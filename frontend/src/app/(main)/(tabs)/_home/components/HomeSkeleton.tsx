import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

export function HomeSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8 px-4 py-8">
      <Skeleton label="홈 화면을 불러오는 중" className="h-7 w-52 rounded-lg" />

      <Skeleton announce={false} className="h-80 w-full rounded-3xl" />

      <Skeleton announce={false} className="h-10 w-full rounded-full" />

      <div className="flex gap-3">
        <Skeleton announce={false} className="size-40 rounded-xl" />

        <Skeleton announce={false} className="size-40 rounded-xl" />
      </div>
    </div>
  );
}
