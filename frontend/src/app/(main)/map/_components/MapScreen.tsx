"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { GetShopMapQuery } from "@sopum-map/shared";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMapScreenState } from "../_hooks/useMapScreenState";
import { toMapMarkerShop, toMapShop } from "../_mappers/mapShop.mapper";

import type { MapBounds, MapMarkerShop } from "@/components/naver-map";
import { useMapViewportSearch } from "../_hooks/useMapViewportSearch";
import {
  createInfiniteShopsQueryOptions,
  createShopMapQueryOptions,
  useInfiniteShops,
  useShopDetail,
  useShopMap,
} from "@/api/shops/shop.query";

import { MapLocationControls } from "./map-canvas/MapLocationControls";
import { NaverMapCanvas } from "./map-canvas/NaverMapCanvas";
import { MapFilterSheet } from "./MapFilterSheet";
import { MapSearchHeader } from "./MapSearchHeader";
import { MapSearchSheet } from "./MapSearchSheet";
import { MapSelectedShopCard } from "./MapSelectedShopCard";
import { MapShopListSheet } from "./MapShopListSheet";
import { MapTagFilterChips } from "./MapTagFilterChips";
import { MapAreaSearchButton } from "./MapAreaSearchButton";

type MapScreenProps = Readonly<{
  mapSlot?: (props: {
    shops: MapMarkerShop[];
    selectedShopId?: string;
    onSelectShop: (shopId: string) => void;
    onBoundsChange: (bounds: MapBounds) => void;
  }) => ReactNode;
}>;

const PAGE_SIZE = 10;

/** 검색 조건의 순서 차이를 제거해 같은 필터인지 비교할 키를 만듭니다. */
function createSearchFilterKey(
  keyword: string | undefined,
  tagKeys: readonly string[] | undefined,
): string {
  return JSON.stringify([
    keyword ?? "",
    [...(tagKeys ?? [])].sort(),
  ]);
}

/** 지도, 검색, 필터와 상점 탐색 화면을 조합합니다. */
export function MapScreen({ mapSlot }: MapScreenProps) {
  const {
    keyword,
    handleClearKeyword,
    debouncedKeyword,
    pickedOnly,
    selectedTagKeys,
    selectedShopId,
    isFilterOpen,
    isSearchOpen,
    shopListSheetState,
    setShopListSheetState,
    selectShop,
    handleKeywordChange,
    handleShowAll,
    handleShowPicked,
    handleToggleTag,
    handleOpenFilter,
    handleCloseFilter,
    handleOpenSearch,
    handleSelectSearchResult,
    handleSearchOpenChange,
    handleShowShopList,
    resetFilters,
  } = useMapScreenState();

  const queryClient = useQueryClient();
  const [searchErrorMessage, setSearchErrorMessage] = useState<string>();
  const [committedSearchQuery, setCommittedSearchQuery] =
    useState<GetShopMapQuery>();
  const lastAttemptedFilterKeyRef = useRef<string | null>(null);

  const {
    draftBounds,
    requestedBounds,
    searchedBounds,
    needsSearch,
    initializeBounds,
    updateDraftBounds,
    startSearch,
    commitSearch,
    failSearch,
  } = useMapViewportSearch();

  /** 지도와 목록에서 함께 사용하는 검색 조건을 만듭니다. */
  const createSearchQueries = useCallback(
    (bounds: MapBounds) => {
      const tagKeys =
        selectedTagKeys.length > 0
          ? [...selectedTagKeys].sort()
          : undefined;

      const sharedQuery = {
        bounds,
        keyword: debouncedKeyword || undefined,
        tagKeys,
      };

      return {
        mapQuery: sharedQuery,
        listQuery: {
          ...sharedQuery,
          limit: PAGE_SIZE,
          sort: "latest" as const,
        },
      };
    },
    [debouncedKeyword, selectedTagKeys],
  );

  const searchArea = useCallback(
    async (bounds: MapBounds) => {
      const { mapQuery, listQuery } = createSearchQueries(bounds);

      setSearchErrorMessage(undefined);

      try {
        await Promise.all([
          queryClient.query(createShopMapQueryOptions(mapQuery)),
          queryClient.infiniteQuery(createInfiniteShopsQueryOptions(listQuery)),
        ]);

        setCommittedSearchQuery(mapQuery);
        commitSearch();
      } catch (error) {
        failSearch();

        setSearchErrorMessage(
          error instanceof Error
            ? error.message
            : "상점 정보를 불러오지 못했습니다.",
        );
      }
    },
    [commitSearch, createSearchQueries, failSearch, queryClient],
  );

  /** 최초 지도 경계는 검색 영역으로 등록하고 이후 변경은 임시 영역으로 저장합니다. */
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      if (!draftBounds) {
        const initialBounds = initializeBounds(bounds);

        void searchArea(initialBounds);
        return;
      }

      updateDraftBounds(bounds);
    },
    [draftBounds, initializeBounds, searchArea, updateDraftBounds],
  );

  /** 사용자가 현재 보고 있는 지도 영역의 검색을 확정합니다. */
  const handleSearchArea = useCallback(() => {
    const bounds = startSearch();

    if (!bounds) {
      return;
    }

    void searchArea(bounds);
  }, [searchArea, startSearch]);

  const currentFilterKey = useMemo(
    () =>
      createSearchFilterKey(
        debouncedKeyword || undefined,
        selectedTagKeys,
      ),
    [debouncedKeyword, selectedTagKeys],
  );

  const committedFilterKey = useMemo(
    () =>
      committedSearchQuery
        ? createSearchFilterKey(
            committedSearchQuery.keyword,
            committedSearchQuery.tagKeys,
          )
        : undefined,
    [committedSearchQuery],
  );

  /** 검색어·태그가 바뀌면 현재 지도 영역을 같은 원자적 조회 흐름으로 갱신합니다. */
  useEffect(() => {
    if (!draftBounds || !searchedBounds || requestedBounds) {
      return;
    }

    if (currentFilterKey === committedFilterKey) {
      lastAttemptedFilterKeyRef.current = null;
      return;
    }

    if (lastAttemptedFilterKeyRef.current === currentFilterKey) {
      return;
    }

    let isCancelled = false;

    queueMicrotask(() => {
      if (isCancelled) {
        return;
      }

      const bounds = startSearch();

      if (!bounds) {
        return;
      }

      lastAttemptedFilterKeyRef.current = currentFilterKey;
      void searchArea(bounds);
    });

    return () => {
      isCancelled = true;
    };
  }, [
    committedFilterKey,
    currentFilterKey,
    draftBounds,
    requestedBounds,
    searchArea,
    searchedBounds,
    startSearch,
  ]);

  /** 화면에 표시할 목록 쿼리 */
  const committedListQuery = useMemo(
    () => ({
      bounds: committedSearchQuery?.bounds,
      keyword: committedSearchQuery?.keyword,
      tagKeys: committedSearchQuery?.tagKeys,
      limit: PAGE_SIZE,
      sort: "latest" as const,
    }),
    [committedSearchQuery],
  );

  /** 목록 무한 스크롤 조회 */
  const {
    data: shopsData,
    isLoading,
    isError: isListError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteShops(committedListQuery, Boolean(committedSearchQuery));

  /** 지도 마커 조회 */
  const { data: shopMapData, isError: isMapError } = useShopMap(
    committedSearchQuery,
    Boolean(committedSearchQuery),
  );

  /** 지도 API 응답을 실제 마커 표시 모델로 변환합니다. */
  const markerShops = useMemo(() => {
    const markers = shopMapData?.items ?? [];

    const visibleMarkers = pickedOnly
      ? markers.filter((marker) => marker.isLiked)
      : markers;

    return visibleMarkers.map(toMapMarkerShop);
  }, [pickedOnly, shopMapData]);

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
          shops: markerShops,
          selectedShopId,
          onSelectShop: selectShop,
          onBoundsChange: handleBoundsChange,
        })
      ) : (
        <NaverMapCanvas
          shops={markerShops}
          selectedShopId={selectedShopId}
          onSelectShop={selectShop}
          onBoundsChange={handleBoundsChange}
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
          onClearKeyword={handleClearKeyword}
        />

        {needsSearch ||
        (requestedBounds && searchedBounds) ||
        Boolean(searchErrorMessage) ? (
          <MapAreaSearchButton
            isSearching={Boolean(requestedBounds)}
            onSearch={handleSearchArea}
          />
        ) : null}

        {shopMapData?.isTruncated ? (
          <p
            role="status"
            className="
            absolute left-1/2 top-44 z-30
            -translate-x-1/2 whitespace-nowrap
            rounded-full bg-white px-4 py-2
            text-12 text-black-500 shadow-md
          "
          >
            상점이 많아요. 지도를 확대해 주세요.
          </p>
        ) : null}

        <MapTagFilterChips
          pickedOnly={pickedOnly}
          hasDetailedFilters={selectedTagKeys.length > 0}
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
        selectedTagCount={selectedTagKeys.length}
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
        selectedTagKeys={selectedTagKeys}
        onToggleTag={handleToggleTag}
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

      {searchErrorMessage || isMapError || isListError ? (
        <div
          role="alert"
          className="
              absolute
              left-1/2
              top-24
              z-30
              -translate-x-1/2
              rounded-control
              bg-white
              px-4
              py-3
              shadow-md
            "
        >
          {searchErrorMessage ??
            (isMapError
              ? "지도 마커를 불러오지 못했습니다."
              : "상점 목록을 불러오지 못했습니다.")}
        </div>
      ) : null}
    </section>
  );
}
