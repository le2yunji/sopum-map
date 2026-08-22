import { MAP_REGIONS, type MapRegion } from "../_constants/map.constants";
import type { MapShop } from "../_types/map.types";

type FilterShopsParams = Readonly<{
  shops: MapShop[];
  keyword: string;
  selectedRegion: MapRegion;
  selectedTags: string[];
}>;

export function filterShops({
  shops,
  keyword,
  selectedRegion,
  selectedTags,
}: FilterShopsParams) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase("ko-KR");

  const selectedRegionGroup = MAP_REGIONS.find(
    (region) => region.value === selectedRegion,
  );

  return shops.filter((shop) => {
    const matchesKeyword =
      !normalizedKeyword ||
      [shop.name, shop.address, shop.region, ...shop.tags]
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedKeyword);

    const matchesRegion =
      selectedRegion === "all" ||
      selectedRegionGroup?.regions.some((region) =>
        shop.region.includes(region),
      ) === true;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => shop.tags.includes(tag));

    return matchesKeyword && matchesRegion && matchesTags;
  });
}
