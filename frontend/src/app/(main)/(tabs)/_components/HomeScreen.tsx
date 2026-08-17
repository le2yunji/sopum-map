import type { HomeData } from "../_types/home.types";
import { HomeBrandMessage } from "./HomeBrandMessage";

import { HomeCategorySection } from "./HomeCategorySection";
import { HomeCourseSection } from "./HomeCourseSection";
import { HomeHeader } from "./HomeHeader";
import { ShopBannerCarousel } from "@/components/ui/ShopBannerCarousel/ShopBannerCarousel";

type Props = Readonly<{
  data: HomeData;
  initialCategory?: string;
}>;

export function HomeScreen({ data, initialCategory = "all" }: Props) {
  return (
    <main className="bg-white pb-8">
      <HomeHeader />

      <ShopBannerCarousel
        items={data.curation}
        ariaLabel="오늘의 추천 소품샵"
      />

      <HomeCategorySection
        categories={data.categories}
        shopsByCategory={data.shopsByCategory}
        initialCategory={initialCategory}
      />

      <HomeCourseSection courses={data.courses} />

      <HomeBrandMessage />
    </main>
  );
}
