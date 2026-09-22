import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

export function PicksSkeleton() {
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-5">
      <Skeleton
        label="내 픽을 불러오는 중"
        className="aspect-square rounded-2xl"
      />

      <Skeleton announce={false} className="aspect-square rounded-2xl" />
    </div>
  );
}
