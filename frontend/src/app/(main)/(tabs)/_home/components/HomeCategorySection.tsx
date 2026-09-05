"use client";

import { SHOP_CATEGORIES, type ShopCategory } from "@sopum-map/shared";
import { useState, useRef } from "react";

import { useInfiniteShops } from "@/api/shops/shop.query";
import { PickAction } from "@/components/pick/PickAction";
import { FilterChipGroup } from "@/components/ui/FilterChipGroup/FilterChipGroup";
import { ShopCard } from "@/components/ui/ShopCard/ShopCard";

import { toHomeShopCardItem } from "../mappers/homeShopCard.mapper";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type HomeCategory = "all" | ShopCategory;

const HOME_CATEGORY_ITEMS = [
  {
    value: "all",
    label: "전체",
  },

  ...SHOP_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  })),
] satisfies ReadonlyArray<{
  value: HomeCategory;
  label: string;
}>;

export function HomeCategorySection() {
  const [selectedCategory, setSelectedCategory] = useState<HomeCategory>("all");
  const listRef = useRef<HTMLUListElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteShops({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 10,
    sort: "latest",
  });

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
    rootRef: listRef,
    rootMargin: "0px 200px",
  });

  const shops = data?.pages.flatMap((page) => page.items) ?? [];

  const shopItems = shops.map(toHomeShopCardItem);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as HomeCategory);
  };

  return (
    <section aria-labelledby="home-category-title" className="mt-6">
      <div className="flex items-center justify-between px-4">
        <h2 id="home-category-title" className="text-16 font-semibold">
          카테고리
        </h2>

        <span className="text-12 text-black-500">더 보기</span>
      </div>

      <FilterChipGroup
        items={HOME_CATEGORY_ITEMS}
        selectedValue={selectedCategory}
        onValueChange={handleCategoryChange}
        ariaLabel="상점 카테고리"
        className="mt-2 px-4"
      />

      {isLoading ? (
        <div
          role="status"
          className="px-4 py-8 text-center text-13 text-black-500"
        >
          상점을 불러오고 있어요
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="px-4 py-8 text-center text-13 text-black-500"
        >
          상점을 불러오지 못했어요
        </div>
      ) : shopItems.length > 0 ? (
        <ul
          ref={listRef}
          className="
            mt-4 flex gap-3
            overflow-x-auto px-4 pb-2
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {shopItems.map((shop) => (
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
          {hasNextPage && (
            <li
              ref={loadMoreRef}
              aria-hidden="true"
              className="w-px shrink-0"
            />
          )}
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
