"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { MAP_REGIONS, type MapRegion } from "../_constants/map.constants";
import type { MapShop } from "../_types/map.types";
import { filterShops } from "../_utils/filterShops";

import { MapControlButtons } from "./MapControlButtons";
import { MapFilterSheet } from "./MapFilterSheet";
import { MapRegionChips } from "./MapRegionChips";
import { MapSearchHeader } from "./MapSearchHeader";
import { MapSearchSheet } from "./MapSearchSheet";
import { MapSelectedShopCard } from "./MapSelectedShopCard";
import { MapShopListSheet } from "./MapShopListSheet";
import { NaverMapCanvas } from "./NaverMapCanvas";
import { MapShopListSheetState } from "../_hooks/mapShopListSheet.types";

type MapScreenProps = Readonly<{
  shops: MapShop[];

  mapSlot?: (props: {
    shops: MapShop[];
    selectedShopId?: string;
    onSelectShop: (shopId: string) => void;
  }) => ReactNode;
}>;

const PAGE_SIZE = 10;

/** 지도, 검색, 지역 필터와 상점 목록 탐색 흐름을 조합합니다. */
export function MapScreen({ shops, mapSlot }: MapScreenProps) {
  const [keyword, setKeyword] = useState("");

  const [selectedRegion, setSelectedRegion] = useState<MapRegion>("all");

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [selectedShopId, setSelectedShopId] = useState<string>();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isSelectedShopCardVisible, setIsSelectedShopCardVisible] =
    useState(false);

  const [shopListSheetState, setShopListSheetState] =
    useState<MapShopListSheetState>("collapsed");

  /** 현재 목록에 노출할 상점 개수 */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /** 검색어/지역/태그 조건에 맞는 전체 상점 */
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

  /** 무한스크롤을 통해 현재까지 노출된 상점 */
  const visibleShops = useMemo(
    () => filteredShops.slice(0, visibleCount),
    [filteredShops, visibleCount],
  );

  /** 아직 추가로 보여줄 상점이 있는지 여부 */
  const hasNextPage = visibleCount < filteredShops.length;

  /** 목록 pagination을 첫 페이지로 초기화합니다. */
  const resetPagination = () => {
    setVisibleCount(PAGE_SIZE);
  };

  /** 무한스크롤에서 다음 상점 묶음을 노출합니다. */
  const loadNextPage = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + PAGE_SIZE, filteredShops.length),
    );
  }, [filteredShops.length]);

  const selectedRegionLabel = useMemo(() => {
    if (selectedRegion === "all") {
      return undefined;
    }

    return MAP_REGIONS.find((region) => region.value === selectedRegion)?.label;
  }, [selectedRegion]);

  const selectedShop = filteredShops.find(
    (shop) => shop.id === selectedShopId,
  );
  const isSelectedShopCardOpen = Boolean(
    selectedShop && isSelectedShopCardVisible,
  );

  /** 지도 마커나 검색 결과에서 선택한 상점 카드를 표시합니다. */
  const selectShop = useCallback((shopId: string) => {
    setSelectedShopId(shopId);
    setShopListSheetState("collapsed");
    setIsSelectedShopCardVisible(true);
  }, []);

  /** 검색어 변경 시 목록을 첫 페이지부터 다시 보여줍니다. */
  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    resetPagination();
  };

  /** 지역 변경 시 목록을 첫 페이지부터 다시 보여줍니다. */
  const handleRegionChange = (region: MapRegion) => {
    setSelectedRegion(region);
    resetPagination();
  };

  /** 태그 변경 시 목록을 첫 페이지부터 다시 보여줍니다. */
  const handleToggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((currentTag) => currentTag !== tag)
        : [...current, tag],
    );

    resetPagination();
  };

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  /** 지도 검색창의 전용 검색 시트를 엽니다. */
  const handleOpenSearch = () => {
    setShopListSheetState("collapsed");
    setIsSearchOpen(true);
  };

  /** 검색 결과를 지도와 상점 목록에 함께 반영합니다. */
  const handleSelectSearchResult = (shopId: string) => {
    selectShop(shopId);
    setIsSearchOpen(false);
  };

  /** 검색 시트가 닫힐 때 목록 시트를 접힌 상태로 되돌립니다. */
  const handleSearchOpenChange = (open: boolean) => {
    setShopListSheetState("collapsed");
    setIsSearchOpen(open);
  };

  /** 선택 카드를 닫고 상점 목록을 다시 보여줍니다. */
  const handleShowShopList = () => {
    setShopListSheetState("collapsed");
    setIsSelectedShopCardVisible(false);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  /** 모든 검색 조건과 pagination을 초기화합니다. */
  const resetFilters = () => {
    setKeyword("");
    setSelectedRegion("all");
    setSelectedTags([]);

    resetPagination();
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
          isSearchOpen={isSearchOpen}
          onOpenSearch={handleOpenSearch}
          onOpenFilter={handleOpenFilter}
        />

        <MapRegionChips
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
        />
      </div>

      <MapControlButtons visible={shopListSheetState === "collapsed"} />

      <MapShopListSheet
        shops={visibleShops}
        totalCount={filteredShops.length}
        visible={!isSelectedShopCardOpen}
        state={shopListSheetState}
        selectedRegionLabel={selectedRegionLabel}
        selectedTagCount={selectedTags.length}
        hasNextPage={hasNextPage}
        isLoadingMore={false}
        onLoadMore={loadNextPage}
        onStateChange={setShopListSheetState}
        onResetFilters={resetFilters}
      />

      {selectedShop && isSelectedShopCardOpen ? (
        <MapSelectedShopCard
          shop={selectedShop}
          onShowList={handleShowShopList}
        />
      ) : null}

      <MapFilterSheet
        open={isFilterOpen}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClose={handleCloseFilter}
      />

      <MapSearchSheet
        open={isSearchOpen}
        keyword={keyword}
        shops={filteredShops}
        onKeywordChange={handleKeywordChange}
        onSelectShop={handleSelectSearchResult}
        onOpenChange={handleSearchOpenChange}
      />
    </section>
  );
}
