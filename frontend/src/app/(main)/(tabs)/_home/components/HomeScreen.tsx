import { HomeBrandMessage } from "./HomeBrandMessage";

import { HomeCategorySection } from "./HomeCategorySection";
import { HomeCourseSection } from "./HomeCourseSection";
import { HomeCuratedShopSection } from "./HomeCuratedShopSection";
import { HomeHeader } from "./HomeHeader";

export function HomeScreen() {
  return (
    <main className="bg-white pb-8">
      <HomeHeader />

      <HomeCuratedShopSection />

      <HomeCategorySection />

      <HomeCourseSection />

      <HomeBrandMessage />
    </main>
  );
}
