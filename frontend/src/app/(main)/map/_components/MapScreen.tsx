"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { MAP_REGIONS, type MapRegion } from "../_constants/map.constants";
import type { MapShop } from "../_types/map.types";
import { filterShops } from "../_utils/filterShops";

import { MapControlButtons } from "./MapControlButtons";
import { MapFilterSheet } from "./MapFilterSheet";
import { MapRegionChips } from "./MapRegionChips";
import { MapSearchHeader } from "./MapSearchHeader";
import {
  MapShopListSheet,
  type MapShopListSheetState,
} from "./MapShopListSheet";
import { NaverMapCanvas } from "./NaverMapCanvas";

type MapScreenProps = Readonly<{
  shops: MapShop[];

  mapSlot?: (props: {
    shops: MapShop[];
    selectedShopId?: string;
    onSelectShop: (shopId: string) => void;
  }) => ReactNode;
}>;

/** 지도, 검색, 지역 필터와 상점 목록 탐색 흐름을 조합합니다. */
export function MapScreen({ shops, mapSlot }: MapScreenProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<MapRegion>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [shopListSheetState, setShopListSheetState] =
    useState<MapShopListSheetState>("collapsed");

  const filteredShops = useMemo(
    () =>
      filterShops({
        shops,
        keyword,
        selectedRegion,
        selectedTags,
      }),
    [shops, keyword, selectedRegion, selectedTags],
  );

  const selectedRegionLabel = useMemo(() => {
    if (selectedRegion === "all") {
      return undefined;
    }

    return MAP_REGIONS.find((region) => region.value === selectedRegion)?.label;
  }, [selectedRegion]);

  const selectShop = useCallback((shopId: string) => {
    setSelectedShopId(shopId);
  }, []);

  const handleRegionChange = (region: MapRegion) => {
    setSelectedRegion(region);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((currentTag) => currentTag !== tag)
        : [...current, tag],
    );
  };

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setKeyword("");
    setSelectedRegion("all");
    setSelectedTags([]);
  };

  return (
    <section
      aria-labelledby="map-heading"
      className="
        relative
        h-dvh
        min-h-[560px]
        overflow-hidden
        bg-green-50
      "
    >
      <h1 id="map-heading" className="sr-only">
        소품샵 지도
      </h1>

      {mapSlot ? (
        mapSlot({
          shops: filteredShops,
          selectedShopId,
          onSelectShop: selectShop,
        })
      ) : (
        <NaverMapCanvas
          shops={filteredShops}
          selectedShopId={selectedShopId}
          onSelectShop={selectShop}
        />
      )}

      <div
        className="
          absolute
          inset-x-0
          top-0
          z-20
          space-y-2
          bg-gradient-to-b
          from-white/95
          to-transparent
          px-4
          pb-8
          pt-3
        "
      >
        <MapSearchHeader
          keyword={keyword}
          isFilterOpen={isFilterOpen}
          onKeywordChange={setKeyword}
          onOpenFilter={handleOpenFilter}
        />

        <MapRegionChips
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
        />
      </div>

      <MapControlButtons visible={shopListSheetState === "collapsed"} />

      <MapShopListSheet
        shops={filteredShops}
        state={shopListSheetState}
        selectedShopId={selectedShopId}
        selectedRegionLabel={selectedRegionLabel}
        selectedTagCount={selectedTags.length}
        onStateChange={setShopListSheetState}
        onSelectShop={selectShop}
        onResetFilters={resetFilters}
      />

      <MapFilterSheet
        open={isFilterOpen}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClose={handleCloseFilter}
      />
    </section>
  );
}
