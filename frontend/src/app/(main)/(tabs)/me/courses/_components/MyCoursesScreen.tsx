"use client";

import { useMyCourses } from "@/api/course/course.query";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

import { CourseListCard } from "./CourseListCard";

export function MyCoursesScreen() {
  const { data, isPending, isError, refetch } = useMyCourses();

  if (isPending) {
    return <div className="px-5 pt-16">코스를 불러오는 중...</div>;
  }

  if (isError) {
    return (
      <StatePanel
        title="내 코스를 불러오지 못했어요"
        action="다시 시도"
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  const courses = data?.items ?? [];

  if (courses.length === 0) {
    return (
      <StatePanel
        title="아직 만든 코스가 없어요"
        description="내 픽 폴더에서 나만의 코스를 만들어보세요."
      />
    );
  }

  return (
    <section className="min-h-full bg-white px-5 pb-24 pt-16">
      <header>
        <p className="text-12 text-green-700">나의 코스</p>

        <h1 className="mt-1 text-24 font-semibold">내 코스</h1>
      </header>

      <div className="mt-6 space-y-3">
        {courses.map((course) => (
          <CourseListCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
