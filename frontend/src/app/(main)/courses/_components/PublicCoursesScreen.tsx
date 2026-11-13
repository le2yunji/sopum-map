"use client";

import {
  SHOP_REGION_GROUP_LABELS,
  SHOP_REGION_GROUPS,
  type PublicCourseSort,
} from "@sopum-map/shared";
import { useRouter } from "next/navigation";
import type { ChangeEvent, ReactNode } from "react";

import { useInfinitePublicCourses } from "@/api/course/course.query";
import { BackButton } from "@/components/navigation/BackButton";
import { CourseListItem } from "@/components/ui/CourseListItem/CourseListItem";
import { FilterChipGroup } from "@/components/ui/FilterChipGroup/FilterChipGroup";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import type { PublicCourseBrowseQuery } from "../_utils/public-course-search-params";

const REGION_FILTER_ITEMS = [
  {
    value: "all",
    label: "전체",
  },
  ...SHOP_REGION_GROUPS.map((regionGroup) => ({
    value: regionGroup,
    label: SHOP_REGION_GROUP_LABELS[regionGroup],
  })),
];

const SORT_OPTIONS = [
  {
    value: "latest",
    label: "최신순",
  },
  {
    value: "popular",
    label: "인기순",
  },
] satisfies readonly Readonly<{
  value: PublicCourseSort;
  label: string;
}>[];

/** 공개 코스 검색 조건을 브라우저 주소로 변환합니다. */
function createPublicCoursesPath(query: PublicCourseBrowseQuery): string {
  const searchParams = new URLSearchParams();

  if (query.regionGroup) {
    searchParams.set("regionGroup", query.regionGroup);
  }

  searchParams.set("sort", query.sort);

  return `/courses?${searchParams.toString()}`;
}

/** 지역 필터 값에서 지원하는 지역만 반환합니다. */
function findRegionGroup(value: string) {
  return SHOP_REGION_GROUPS.find((regionGroup) => regionGroup === value);
}

/** 정렬 선택값에서 지원하는 정렬만 반환합니다. */
function findCourseSort(value: string): PublicCourseSort {
  const option = SORT_OPTIONS.find((item) => item.value === value);

  return option?.value ?? "latest";
}

/** 공개 코스 카드가 표시될 자리를 유지합니다. */
function PublicCoursesSkeleton() {
  return (
    <main
      role="status"
      aria-label="공개 코스를 불러오는 중"
      className="px-5 py-4"
    >
      <span className="sr-only">공개 코스를 불러오는 중입니다.</span>

      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          aria-hidden="true"
          className="flex items-center gap-3 py-4"
        >
          <Skeleton
            announce={false}
            className="size-20 shrink-0 rounded-card"
          />

          <div className="flex-1">
            <Skeleton announce={false} className="h-5 w-2/3 rounded-control" />

            <Skeleton
              announce={false}
              className="mt-2 h-4 w-full rounded-control"
            />

            <Skeleton
              announce={false}
              className="mt-3 h-5 w-1/2 rounded-full"
            />
          </div>
        </div>
      ))}
    </main>
  );
}

type PublicCoursesScreenProps = Readonly<{
  initialQuery: PublicCourseBrowseQuery;
}>;

/** URL 검색 조건에 맞는 공개 코스를 필터링하고 무한 목록으로 표시합니다. */
export function PublicCoursesScreen({
  initialQuery,
}: PublicCoursesScreenProps) {
  const router = useRouter();
  const coursesQuery = useInfinitePublicCourses(initialQuery);

  const courses = coursesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  /** 다음 검색 조건으로 주소를 교체합니다. */
  const replaceQuery = (nextQuery: PublicCourseBrowseQuery) => {
    if (
      nextQuery.regionGroup === initialQuery.regionGroup &&
      nextQuery.sort === initialQuery.sort
    ) {
      return;
    }

    router.replace(createPublicCoursesPath(nextQuery));
  };

  /** 선택한 지역으로 검색 조건을 변경합니다. */
  const handleRegionChange = (value: string) => {
    const regionGroup = findRegionGroup(value);

    replaceQuery({
      regionGroup,
      sort: initialQuery.sort,
    });
  };

  /** 선택한 정렬 방식으로 검색 조건을 변경합니다. */
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    replaceQuery({
      regionGroup: initialQuery.regionGroup,
      sort: findCourseSort(event.target.value),
    });
  };

  /** 추가 페이지가 있을 때 다음 커서 요청을 실행합니다. */
  const loadNextPage = () => {
    if (!coursesQuery.hasNextPage || coursesQuery.isFetchingNextPage) {
      return;
    }

    void coursesQuery.fetchNextPage();
  };

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadNextPage,
    hasNextPage: Boolean(coursesQuery.hasNextPage),
    isLoading: coursesQuery.isFetchingNextPage,
  });

  let resultContent: ReactNode;

  if (coursesQuery.isPending) {
    resultContent = <PublicCoursesSkeleton />;
  } else if (coursesQuery.isError) {
    resultContent = (
      <StatePanel
        title="산책 코스를 불러오지 못했습니다."
        action="다시 시도"
        onAction={() => {
          void coursesQuery.refetch();
        }}
      />
    );
  } else if (courses.length === 0) {
    resultContent = (
      <StatePanel
        title="아직 공개된 산책 코스가 없습니다."
        description="다른 지역이나 정렬 조건을 선택해 보세요."
      />
    );
  } else {
    resultContent = (
      <main className="px-5 pb-24">
        <div>
          {courses.map((course, index) => (
            <CourseListItem
              key={course.id}
              course={course}
              imageLoading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>

        {coursesQuery.hasNextPage ? (
          <div ref={loadMoreRef} aria-hidden="true" className="h-8" />
        ) : null}

        {coursesQuery.isFetchingNextPage ? (
          <div
            role="status"
            className="py-4 text-center text-13 text-black-500"
          >
            코스를 더 불러오는 중...
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <header className="px-5 pt-4">
        <div className="flex min-h-11 items-center gap-2">
          <BackButton className="-ml-2" />

          <h1 className="text-20 font-semibold text-black-950">산책 코스</h1>
        </div>

        <FilterChipGroup
          ariaLabel="지역 필터"
          items={REGION_FILTER_ITEMS}
          selectedValue={initialQuery.regionGroup ?? "all"}
          onValueChange={handleRegionChange}
          className="-mx-5 mt-4 px-5 pb-1"
        />

        <div className="mt-3 flex justify-end">
          <select
            aria-label="정렬"
            value={initialQuery.sort}
            onChange={handleSortChange}
            className="
              min-h-10 rounded-control
              border border-black-200
              bg-white px-3
              text-14 text-black-800
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-green-500
            "
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="mt-2">{resultContent}</div>
    </div>
  );
}
