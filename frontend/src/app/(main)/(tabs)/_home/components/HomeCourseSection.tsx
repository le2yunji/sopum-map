"use client";

import Link from "next/link";
import { CourseListItem } from "@/components/ui/CourseListItem/CourseListItem";
import { useHomeCourseRecommendations } from "@/api/course/course.query";

import { Button } from "@/components/ui/Button";
import { HomeCourseSectionSkeleton } from "./HomeSkeleton";
import { HomeCourseSectionBoundary } from "./HomeCourseSectionBoundary";

/** 홈 추천 API의 상태와 코스 목록을 화면에 표시합니다. */
export function HomeCourseSectionContent() {
  const { data, isPending, isError, refetch } = useHomeCourseRecommendations();

  const courses = data?.items ?? [];

  return (
    <section
      aria-labelledby="home-course-title"
      className="mt-9 border-y-8 border-black-100/50 px-4 pt-7 pb-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-course-title" className="text-16 font-semibold">
          추천 산책 코스
        </h2>

        <Link
          href="/courses"
          className="shrink-0 rounded-control px-2 py-2 text-12 text-black-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          더 보기
        </Link>
      </div>

      {isPending ? (
        <HomeCourseSectionSkeleton />
      ) : isError ? (
        <div
          role="alert"
          className="mt-2 rounded-card bg-green-50 px-4 py-7 text-center"
        >
          <p className="text-14 font-medium text-green-900">
            추천 코스를 불러오지 못했습니다.
          </p>

          <Button
            variant="outline"
            size="small"
            className="mt-4"
            onClick={() => {
              void refetch();
            }}
          >
            다시 시도
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div
          role="status"
          className="mt-2 rounded-card bg-green-50 px-4 py-7 text-center"
        >
          <p className="text-14 font-medium text-green-900">
            아직 공개된 산책 코스가 없습니다.
          </p>

          <p className="mt-1 text-12 text-black-500">
            새로운 산책 코스를 준비하고 있습니다.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-black-100">
          {courses.map((course) => (
            <li key={course.id}>
              <CourseListItem course={course} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** 추천 코스 오류를 홈의 다른 영역과 분리해 표시합니다. */
export function HomeCourseSection() {
  return (
    <HomeCourseSectionBoundary>
      <HomeCourseSectionContent />
    </HomeCourseSectionBoundary>
  );
}
