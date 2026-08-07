import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

/** 온보딩 화면의 최종 배치를 유지하는 로딩 상태입니다. */
export default function OnboardingLoading() {
  return (
    <main
      aria-busy="true"
      className="flex min-h-dvh flex-col bg-white px-5 pb-5 pt-8"
    >
      <section className="flex flex-1 flex-col items-center justify-center">
        <Skeleton
          label="온보딩 화면을 불러오는 중"
          className="size-36 rounded-full min-[390px]:size-40"
        />
        <Skeleton announce={false} className="mt-7 h-8 w-28 rounded-lg" />
        <Skeleton announce={false} className="mt-3 h-6 w-64 rounded-lg" />
        <Skeleton announce={false} className="mt-2 h-6 w-52 rounded-lg" />
      </section>

      <div aria-hidden="true" className="mx-auto w-full max-w-84">
        <Skeleton announce={false} className="h-15 w-full rounded-2xl" />
        <Skeleton
          announce={false}
          className="mx-auto mt-2 h-12 w-28 rounded-xl"
        />
        <Skeleton
          announce={false}
          className="mx-auto mt-5 h-4 w-32 rounded-md"
        />
      </div>
    </main>
  );
}
