"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { CourseListItem } from "@/components/ui/CourseListItem/CourseListItem";
import { FilterChipGroup } from "@/components/ui/FilterChipGroup/FilterChipGroup";
import { ShopBannerCarousel } from "@/components/ui/ShopBannerCarousel/ShopBannerCarousel";
import { ShopCard } from "@/components/ui/ShopCard/ShopCard";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

import type { HomeData, HomeViewState } from "../_types/home.types";

type HomeScreenProps = Readonly<{
  data: HomeData;
  initialCategory?: string;
  state?: HomeViewState;
  onRetry?: () => void;
}>;

/** 홈 콘텐츠와 비슷한 크기를 유지하는 초기 로딩 화면입니다. */
function HomeLoading() {
  return (
    <div aria-busy="true" className="space-y-8 px-4 py-8">
      <Skeleton label="홈 화면을 불러오는 중" className="h-7 w-52 rounded-lg" />
      <Skeleton announce={false} className="h-80 w-full rounded-3xl" />
      <Skeleton announce={false} className="h-10 w-full rounded-full" />
      <div className="flex gap-3">
        <Skeleton announce={false} className="size-40 rounded-xl" />
        <Skeleton announce={false} className="size-40 rounded-xl" />
      </div>
    </div>
  );
}

/** 홈 전체 데이터를 표시할 수 없을 때 복구 행동을 안내합니다. */
function HomeUnavailable({ onRetry }: Pick<HomeScreenProps, "onRetry">) {
  return (
    <section className="flex min-h-[70dvh] flex-col items-center justify-center px-5 text-center">
      <span aria-hidden="true" className="text-24 text-green-500">♧</span>
      <h1 className="mt-3 text-20 font-semibold">홈 소식을 불러오지 못했어</h1>
      <p className="mt-2 text-14 text-black-500">잠시 후 다시 확인해줘.</p>
      <Button className="mt-6" onClick={onRetry}>다시 시도</Button>
    </section>
  );
}

/** 임시 표시 데이터를 이용해 홈의 탐색 섹션과 상태를 구성합니다. */
export function HomeScreen({
  data,
  initialCategory = "all",
  state = "success",
  onRetry,
}: HomeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  if (state === "loading") {
    return <HomeLoading />;
  }

  if (state === "error") {
    return <HomeUnavailable onRetry={onRetry} />;
  }

  if (state === "empty") {
    return (
      <section className="flex min-h-[70dvh] flex-col items-center justify-center px-5 text-center">
        <span aria-hidden="true" className="text-24 text-green-500">🍀</span>
        <h1 className="mt-3 text-20 font-semibold">아직 소개할 소품샵이 없어</h1>
        <p className="mt-2 text-14 text-black-500">새로운 취향 공간을 준비하고 있어.</p>
      </section>
    );
  }

  const selectedShops = data.shopsByCategory[selectedCategory] ?? [];

  return (
    <div className="bg-white pb-8">
      <header className="px-4 pb-5 pt-7">
        <p className="text-10 font-bold tracking-[0.12em] text-green-600">DAILY CURATION</p>
        <h1 className="mt-1 text-24 font-bold tracking-[-0.03em] text-black-950">오늘의 행운을 찾아서 🍀</h1>
        <p className="mt-2 text-12 leading-5 text-black-500">일상 속 숨겨진 작은 보물 같은 소품샵을 소개해.</p>
      </header>

      <ShopBannerCarousel items={data.curation} ariaLabel="오늘의 추천 소품샵" />

      <section aria-labelledby="home-category-title" className="mt-8">
        <div className="flex items-center justify-between px-4">
          <h2 id="home-category-title" className="text-16 font-semibold">카테고리</h2>
          <span className="text-12 text-black-500">취향별 보기</span>
        </div>
        <FilterChipGroup
          items={data.categories}
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
          ariaLabel="상점 카테고리"
          className="mt-3 px-4"
        />

        {selectedShops.length > 0 ? (
          <ul aria-live="polite" className="mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {selectedShops.map((shop) => (
              <li key={shop.id} className="w-40 shrink-0">
                <ShopCard {...shop} />
              </li>
            ))}
          </ul>
        ) : (
          <div role="status" className="mx-4 mt-4 rounded-2xl bg-green-50 px-4 py-8 text-center">
            <p className="text-14 font-medium text-green-900">이 카테고리의 상점을 준비하고 있어</p>
            <p className="mt-1 text-12 text-black-500">다른 취향도 둘러봐.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="home-course-title" className="mt-9 border-t-8 border-black-100/70 px-4 pt-7">
        <div className="flex items-center justify-between">
          <h2 id="home-course-title" className="text-16 font-semibold">추천 산책 코스</h2>
          <span className="text-12 text-black-500">동네 한 바퀴</span>
        </div>
        <div className="mt-2 divide-y divide-black-100">
          {data.courses.map((course) => <CourseListItem key={course.id} {...course} />)}
        </div>
      </section>

      <blockquote className="mx-4 mt-9 border-t border-green-100 px-4 pt-9 text-center">
        <p aria-hidden="true" className="text-24 text-green-500">✣</p>
        <p className="mt-3 text-12 leading-6 text-black-800">“작은 것들을 소중히 여기는 마음이<br />당신의 하루를 더 특별하게 만들 거야.”</p>
        <footer className="mt-2 text-10 text-black-400">— 나만의 소품지도</footer>
      </blockquote>
    </div>
  );
}
