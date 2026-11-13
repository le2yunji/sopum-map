import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

const HOME_COURSE_SKELETON_COUNT = 3;

/** 추천 코스 카드와 비슷한 크기의 로딩 화면을 표시합니다. */
export function HomeCourseSectionSkeleton() {
  return (
    <div
      role="status"
      aria-label="추천 코스를 불러오는 중"
      className="divide-y divide-black-100"
    >
      <span className="sr-only">추천 코스를 불러오는 중</span>

      {Array.from({ length: HOME_COURSE_SKELETON_COUNT }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-4">
          <Skeleton
            announce={false}
            className="size-20 shrink-0 rounded-card"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton announce={false} className="h-5 w-3/4 rounded-control" />

            <Skeleton announce={false} className="h-4 w-full rounded-control" />

            <div className="flex gap-1">
              <Skeleton announce={false} className="h-5 w-14 rounded-full" />

              <Skeleton announce={false} className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 홈 전체가 준비될 때까지 주요 영역의 크기를 유지합니다. */
export function HomeSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8 px-4 py-8">
      <Skeleton
        label="홈 화면을 불러오는 중"
        className="h-7 w-52 rounded-control"
      />

      <Skeleton announce={false} className="h-80 w-full rounded-card-lg" />

      <Skeleton announce={false} className="h-10 w-full rounded-full" />

      <div className="flex gap-3">
        <Skeleton announce={false} className="size-40 rounded-card" />

        <Skeleton announce={false} className="size-40 rounded-card" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Skeleton announce={false} className="h-5 w-28 rounded-control" />

          <Skeleton announce={false} className="h-4 w-12 rounded-control" />
        </div>

        <HomeCourseSectionSkeleton />
      </div>
    </div>
  );
}
