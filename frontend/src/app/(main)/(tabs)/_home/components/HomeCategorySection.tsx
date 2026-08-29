"use client";

import { useState } from "react";

import { PickAction } from "@/components/pick/PickAction";
import { FilterChipGroup } from "@/components/ui/FilterChipGroup/FilterChipGroup";
import { ShopCard } from "@/components/ui/ShopCard/ShopCard";

import type { HomeData } from "../types/home.types";

type Props = Readonly<{
  categories: HomeData["categories"];
  shopsByCategory: HomeData["shopsByCategory"];
  initialCategory?: string;
}>;

export function HomeCategorySection({
  categories,
  shopsByCategory,
  initialCategory = "all",
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const selectedShops = shopsByCategory[selectedCategory] ?? [];

  return (
    <section aria-labelledby="home-category-title" className="mt-8">
      <div className="flex items-center justify-between px-4">
        <h2 id="home-category-title" className="text-16 font-semibold">
          카테고리
        </h2>

        <span className="text-12 text-black-500">더 보기</span>
      </div>

      <FilterChipGroup
        items={categories}
        selectedValue={selectedCategory}
        onValueChange={setSelectedCategory}
        ariaLabel="상점 카테고리"
        className="mt-3 px-4"
      />

      {selectedShops.length > 0 ? (
        <ul
          className="
            mt-4 flex gap-3
            overflow-x-auto px-4 pb-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {selectedShops.map((shop) => (
            <li key={shop.id} className="w-40 shrink-0">
              <PickAction shopId={shop.id} initialIsPicked={shop.isLiked}>
                {({ isPicked, onToggle }) => (
                  <ShopCard
                    {...shop}
                    isLiked={isPicked}
                    onLikeClick={onToggle}
                  />
                )}
              </PickAction>
            </li>
          ))}
        </ul>
      ) : (
        <div
          role="status"
          className="
            mx-4 mt-4
            rounded-2xl bg-green-50
            px-4 py-8 text-center
          "
        >
          <p className="text-14 font-medium text-green-900">
            이 카테고리의 상점을 준비하고 있어요
          </p>

          <p className="mt-1 text-12 text-black-500">다른 취향도 둘러보세요.</p>
        </div>
      )}
    </section>
  );
}
