import type { MapTagFilter } from "../_constants/map.constants";
import type { MapShop } from "../_types/map.types";

type FilterShopsParams = Readonly<{
  shops: MapShop[];
  keyword: string;
  selectedFilters: readonly MapTagFilter[];
  pickedOnly: boolean;
}>;

/** 상점이 개별 태그 또는 태그 그룹 필터 하나와 일치하는지 확인합니다. */
function matchesTagFilter(shop: MapShop, filter: MapTagFilter) {
  if (filter.type === "tag") {
    return shop.tags.includes(filter.value);
  }

  return filter.tags.some((tag) => shop.tags.includes(tag));
}

/** 검색어와 선택한 모든 태그 조건에 맞는 지도 상점만 반환합니다. */
export function filterShops({
  shops,
  keyword,
  selectedFilters,
  pickedOnly,
}: FilterShopsParams) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase("ko-KR");

  return shops.filter((shop) => {
    const matchesKeyword =
      !normalizedKeyword ||
      [shop.name, shop.address, shop.regionGroup, ...shop.tags]
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedKeyword);

    const matchesTags =
      selectedFilters.length === 0 ||
      selectedFilters.every((filter) => matchesTagFilter(shop, filter));

    const matchesPicked = !pickedOnly || shop.isLiked;

    return matchesKeyword && matchesTags && matchesPicked;
  });
}
