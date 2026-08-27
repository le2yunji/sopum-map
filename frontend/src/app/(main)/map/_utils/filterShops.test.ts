import { describe, expect, it } from "vitest";

import { MAP_TAG_FILTERS } from "../_constants/map.constants";
import { MAP_SHOPS } from "../_data/map.fixture";
import { filterShops } from "./filterShops";

describe("filterShops", () => {
  it("내 픽을 선택하면 저장한 상점만 표시합니다", () => {
    const shops = filterShops({
      shops: MAP_SHOPS,
      keyword: "",
      selectedFilters: [],
      pickedOnly: true,
    });

    expect(shops.length).toBeGreaterThan(0);
    expect(shops.every((shop) => shop.isLiked)).toBe(true);
  });

  it("태그 그룹에 속한 태그를 하나라도 가진 상점을 표시합니다", () => {
    const characterFilter = MAP_TAG_FILTERS.find(
      (filter) => filter.type === "group" && filter.value === "character",
    );

    expect(characterFilter).toBeDefined();

    const shops = filterShops({
      shops: MAP_SHOPS,
      keyword: "",
      selectedFilters: characterFilter ? [characterFilter] : [],
      pickedOnly: false,
    });

    expect(shops.map((shop) => shop.id)).toEqual(
      expect.arrayContaining(["gachagacha", "hello-bunny"]),
    );
    expect(shops.map((shop) => shop.id)).not.toContain("lucky-clover");
  });
});
