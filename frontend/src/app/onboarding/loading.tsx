import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 온보딩 화면의 최종 배치를 유지하는 로딩 상태입니다. */
export default function OnboardingLoading() {
  return (
    <main
      aria-busy="true"
      className="flex min-h-dvh flex-col bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] min-[390px]:px-5 min-[390px]:pt-[max(2rem,env(safe-area-inset-top))]"
    >
      <section className="flex flex-1 flex-col items-center justify-center py-4">
        <Skeleton
          label="온보딩 화면을 불러오는 중"
          className="h-56 w-72 rounded-3xl min-[390px]:h-64 min-[390px]:w-80"
        />
        <Skeleton
          announce={false}
          className="mt-6 h-7 w-64 rounded-lg min-[390px]:mt-7 min-[390px]:h-8 min-[390px]:w-72"
        />
        <Skeleton
          announce={false}
          className="mt-3 h-6 w-72 rounded-lg min-[390px]:h-7 min-[390px]:w-80"
        />
      </section>

      <nav aria-hidden="true" className="w-full">
        <ol className="flex justify-center gap-2">
          <li>
            <Skeleton announce={false} className="size-2 rounded-full" />
          </li>
          <li>
            <Skeleton announce={false} className="size-2 rounded-full" />
          </li>
          <li>
            <Skeleton announce={false} className="size-2 rounded-full" />
          </li>
          <li>
            <Skeleton announce={false} className="size-2 rounded-full" />
          </li>
        </ol>
        <Skeleton announce={false} className="mt-6 h-14 w-full rounded-xl" />
      </nav>
    </main>
  );
}
