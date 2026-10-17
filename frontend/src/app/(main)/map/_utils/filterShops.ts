import type { TagKey } from "@sopum-map/shared";
import type { MapShop } from "../../../../components/naver-map/naverMap.types";

type FilterShopsParams = Readonly<{
  shops: MapShop[];
  keyword: string;
  selectedFilters: readonly TagKey[];
  pickedOnly: boolean;
}>;

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
      selectedFilters.every((tagKey) => shop.tags.includes(tagKey));

    const matchesPicked = !pickedOnly || shop.isLiked;

    return matchesKeyword && matchesTags && matchesPicked;
  });
}
