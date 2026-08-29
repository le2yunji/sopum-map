"use client";

import { useMemo, type ReactNode } from "react";

import type { TagKey } from "@sopum-map/shared";

import { getMapTagFilterValue } from "../_constants/map.constants";
import { useMapScreenState } from "../_hooks/useMapScreenState";
import { toMapShop } from "../_mappers/mapShop.mapper";
import type { MapShop } from "../_types/map.types";

import { useInfiniteShops, useShopDetail } from "@/api/shops/shop.query";

import { MapLocationControls } from "./canvas/MapLocationControls";
import { NaverMapCanvas } from "./canvas/NaverMapCanvas";
import { MapFilterSheet } from "./MapFilterSheet";
import { MapSearchHeader } from "./MapSearchHeader";
import { MapSearchSheet } from "./MapSearchSheet";
import { MapSelectedShopCard } from "./MapSelectedShopCard";
import { MapShopListSheet } from "./MapShopListSheet";
import { MapTagFilterChips } from "./MapTagFilterChips";

type MapScreenProps = Readonly<{
  mapSlot?: (props: {
    shops: MapShop[];
    selectedShopId?: string;
    onSelectShop: (shopId: string) => void;
  }) => ReactNode;
}>;

const PAGE_SIZE = 10;

/** 지도, 검색, 필터와 상점 탐색 화면을 조합합니다. */
export function MapScreen({ mapSlot }: MapScreenProps) {
  const {
    keyword,
    pickedOnly,
    selectedDetailedFilters,
    selectedShopId,
    isFilterOpen,
    isSearchOpen,
    shopListSheetState,

    setShopListSheetState,

    selectShop,
    handleKeywordChange,
    handleShowAll,
    handleShowPicked,
    handleToggleDetailedFilter,
    handleOpenFilter,
    handleCloseFilter,
    handleOpenSearch,
    handleSelectSearchResult,
    handleSearchOpenChange,
    handleShowShopList,
    resetFilters,
  } = useMapScreenState();

  /**
   * 현재 MapTagFilter 값이 실제 TagKey라는 전제입니다.
   *
   * MapTagFilter에 group 필터도 포함되어 있다면
   * group → tagKeys 변환 로직을 별도로 두어야 합니다.
   */
  const selectedTagKeys = useMemo(
    () =>
      selectedDetailedFilters.map(
        (filter) => getMapTagFilterValue(filter) as TagKey,
      ),
    [selectedDetailedFilters],
  );

  const {
    data: shopsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteShops({
    keyword: keyword.trim() || undefined,
    tagKeys: selectedTagKeys.length > 0 ? selectedTagKeys : undefined,
    limit: PAGE_SIZE,
    sort: "latest",
  });

  /** 조회된 모든 페이지를 하나의 지도 상점 배열로 합칩니다. */
  const shops = useMemo(
    () => shopsData?.pages.flatMap((page) => page.items.map(toMapShop)) ?? [],
    [shopsData],
  );

  /**
   * A안에서는 pickedOnly를 아직 서버 쿼리로 보내지 않습니다.
   *
   * 현재 로드된 데이터 안에서만 임시로 필터링합니다.
   */
  const visibleShops = useMemo(
    () => (pickedOnly ? shops.filter((shop) => shop.isLiked) : shops),
    [pickedOnly, shops],
  );

  const totalCount = shopsData?.pages[0]?.pagination.totalCount ?? 0;

  /**
   * URL에 shopId가 있으면 목록 데이터와 별개로
   * 상세 API를 호출합니다.
   */
  const { data: shopDetailData } = useShopDetail(selectedShopId);

  const selectedShop = useMemo(
    () => (shopDetailData ? toMapShop(shopDetailData) : undefined),
    [shopDetailData],
  );

  const isSelectedShopCardOpen = selectedShop != null;

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
          shops: visibleShops,
          selectedShopId,
          onSelectShop: selectShop,
        })
      ) : (
        <NaverMapCanvas
          shops={visibleShops}
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

      <MapLocationControls
        visible={shopListSheetState === "collapsed"}
        className={isSelectedShopCardOpen ? "bottom-[160px]" : "bottom-[206px]"}
      />

      <MapShopListSheet
        shops={visibleShops}
        totalCount={pickedOnly ? visibleShops.length : totalCount}
        visible={!isSelectedShopCardOpen}
        state={shopListSheetState}
        selectedTagCount={selectedDetailedFilters.length}
        hasNextPage={Boolean(hasNextPage)}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => {
          void fetchNextPage();
        }}
        onStateChange={setShopListSheetState}
        onResetFilters={resetFilters}
      />

      {selectedShop ? (
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
        shops={visibleShops}
        totalCount={totalCount}
        onKeywordChange={handleKeywordChange}
        onSelectShop={handleSelectSearchResult}
        onOpenChange={handleSearchOpenChange}
      />

      {isLoading ? (
        <div role="status" className="sr-only">
          상점 목록을 불러오는 중입니다.
        </div>
      ) : null}

      {isError ? (
        <div
          role="alert"
          className="
            absolute
            left-1/2
            top-24
            z-30
            -translate-x-1/2
            rounded-lg
            bg-white
            px-4
            py-3
            shadow-md
          "
        >
          상점 정보를 불러오지 못했습니다.
        </div>
      ) : null}
    </section>
  );
}
