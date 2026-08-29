import { CourseListItem } from "@/components/ui/CourseListItem/CourseListItem";

import type { HomeData } from "../types/home.types";

type Props = Readonly<{
  courses: HomeData["courses"];
}>;

export function HomeCourseSection({ courses }: Props) {
  return (
    <section
      aria-labelledby="home-course-title"
      className="mt-9 border-t-8 border-b-8 border-black-100/50 px-4 pt-7 pb-4"
    >
      <div className="flex items-center justify-between">
        <h2 id="home-course-title" className="text-16 font-semibold">
          추천 산책 코스
        </h2>

        <span className="text-12 text-black-500">더 보기</span>
      </div>

      <div className="mt-2 divide-y divide-black-100">
        {courses.map((course) => (
          <CourseListItem key={course.id} {...course} />
        ))}
      </div>
    </section>
  );
}
