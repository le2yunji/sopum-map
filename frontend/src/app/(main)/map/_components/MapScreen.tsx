"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  getMapTagFilterValue,
  type MapTagFilter,
} from "../_constants/map.constants";
import type { MapShop } from "../_types/map.types";
import { filterShops } from "../_utils/filterShops";

import { MapControlButtons } from "./MapControlButtons";
import { MapFilterSheet } from "./MapFilterSheet";
import { MapTagFilterChips } from "./MapTagFilterChips";
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

  const [pickedOnly, setPickedOnly] = useState(false);

  const [selectedDetailedFilters, setSelectedDetailedFilters] = useState<
    MapTagFilter[]
  >([]);

  const [selectedShopId, setSelectedShopId] = useState<string>();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isSelectedShopCardVisible, setIsSelectedShopCardVisible] =
    useState(false);

  const [shopListSheetState, setShopListSheetState] =
    useState<MapShopListSheetState>("collapsed");

  /** 현재 목록에 노출할 상점 개수 */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /** 검색어와 태그 조건에 맞는 전체 상점 */
  const filteredShops = useMemo(
    () =>
      filterShops({
        shops,
        keyword,
        selectedFilters: selectedDetailedFilters,
        pickedOnly,
      }),
    [shops, keyword, pickedOnly, selectedDetailedFilters],
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

  const selectedShop = filteredShops.find((shop) => shop.id === selectedShopId);
  const isSelectedShopCardOpen = Boolean(
    selectedShop && isSelectedShopCardVisible,
  );

  /** 지도 마커나 검색 결과에서 선택한 상점 카드를 표시합니다. */
  const selectShop = useCallback((shopId: string) => {
    setSelectedShopId(shopId);
    setShopListSheetState("collapsed");
    setIsSelectedShopCardVisible(true);
  }, []);

  /** 검색 조건이 바뀔 때 이전 상점 선택을 함께 해제합니다. */
  const clearSelectedShop = () => {
    setSelectedShopId(undefined);
    setIsSelectedShopCardVisible(false);
  };

  /** 검색어 변경 시 목록을 첫 페이지부터 다시 보여줍니다. */
  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    clearSelectedShop();
    resetPagination();
  };

  /** 모든 분류 조건을 지우고 전체 상점을 표시합니다. */
  const handleShowAll = () => {
    setPickedOnly(false);
    setSelectedDetailedFilters([]);
    clearSelectedShop();
    resetPagination();
  };

  /** 태그 조건을 지우고 사용자가 저장한 상점만 표시합니다. */
  const handleShowPicked = () => {
    setPickedOnly(true);
    setSelectedDetailedFilters([]);
    clearSelectedShop();
    resetPagination();
  };

  /** 상세 태그 필터 하나를 추가하거나 제거합니다. */
  const handleToggleDetailedFilter = (filter: MapTagFilter) => {
    const filterValue = getMapTagFilterValue(filter);

    setSelectedDetailedFilters((current) => {
      const isSelected = current.some(
        (selectedFilter) =>
          getMapTagFilterValue(selectedFilter) === filterValue,
      );

      return isSelected
        ? current.filter(
            (selectedFilter) =>
              getMapTagFilterValue(selectedFilter) !== filterValue,
          )
        : [...current, filter];
    });

    setPickedOnly(false);

    clearSelectedShop();
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
    setPickedOnly(false);
    setSelectedDetailedFilters([]);

    clearSelectedShop();
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
          isSearchOpen={isSearchOpen}
          onOpenSearch={handleOpenSearch}
        />

        <MapTagFilterChips
          pickedOnly={pickedOnly}
          hasDetailedFilters={selectedDetailedFilters.length > 0}
          onShowAll={handleShowAll}
          onShowPicked={handleShowPicked}
          onOpenTags={handleOpenFilter}
        />
      </div>

      <MapControlButtons visible={shopListSheetState === "collapsed"} />

      <MapShopListSheet
        shops={visibleShops}
        totalCount={filteredShops.length}
        visible={!isSelectedShopCardOpen}
        state={shopListSheetState}
        selectedTagCount={selectedDetailedFilters.length}
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
        selectedFilters={selectedDetailedFilters}
        onToggleFilter={handleToggleDetailedFilter}
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
