import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 탭 화면이 준비되는 동안 홈과 비슷한 구조를 유지합니다. */
export default function TabsLoading() {
  return (
    <div aria-busy="true" className="space-y-7 px-4 py-7">
      <Skeleton label="화면을 불러오는 중" className="h-8 w-60 rounded-lg" />
      <Skeleton announce={false} className="h-80 w-full rounded-3xl" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            key={index}
            announce={false}
            className="h-10 w-20 rounded-full"
          />
        ))}
      </div>
      <div className="flex gap-3 overflow-hidden">
        <Skeleton announce={false} className="size-40 shrink-0 rounded-xl" />
        <Skeleton announce={false} className="size-40 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}
