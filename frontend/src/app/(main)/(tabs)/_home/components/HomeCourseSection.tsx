import type { ComponentProps } from "react";

import { CourseListItem } from "@/components/ui/CourseListItem/CourseListItem";

type CourseItem = ComponentProps<typeof CourseListItem>;

const MOCK_COURSES = [
  {
    id: "course-1",
    title: "성수에서 만나는 아기자기 소품샵",
    description: "서울숲부터 성수 골목까지 천천히 둘러보는 소품샵 코스",
    imageUrls: [
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
    ],
    tags: ["성수·서울숲", "아기자기", "산책"],
  },
  {
    id: "course-2",
    title: "연남동 소품샵 하루 코스",
    description: "연남동 골목을 걸으며 취향 가득한 소품샵을 발견해보세요",
    imageUrls: [
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
    ],
    tags: ["홍대·연남", "소품샵", "데이트"],
  },
  {
    id: "course-3",
    title: "망원에서 즐기는 소소한 취향 여행",
    description: "망원시장 근처의 개성 있는 소품샵을 모아봤어요",
    imageUrls: [
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
      "/images/shops/shop_example.png",
    ],
    tags: ["망원", "문구", "구경맛집"],
  },
] satisfies CourseItem[];
export function HomeCourseSection() {
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
        {MOCK_COURSES.map((course) => (
          <CourseListItem key={course.id} {...course} />
        ))}
      </div>
    </section>
  );
}
