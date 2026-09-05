"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  getMapTagFilterValue,
  type MapTagFilter,
} from "../_constants/map.constants";

import { useMapShopListSheetState } from "./mapShopListSheet/useMapShopListSheetState";

/** 지도 화면의 검색·필터·선택·시트 UI 상태를 관리합니다. */
export function useMapScreenState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState("");

  const debouncedKeyword = useDebouncedValue(keyword.trim(), 300);

  /**
   * 선택된 상점은 URL을 기준으로 관리합니다.
   * /map?shopId=123
   */
  const selectedShopId = searchParams.get("shopId") ?? undefined;

  const [pickedOnly, setPickedOnly] = useState(false);
  const [selectedDetailedFilters, setSelectedDetailedFilters] = useState<
    MapTagFilter[]
  >([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shopListSheetState, setShopListSheetState] =
    useMapShopListSheetState();

  /** URL에서 선택된 상점 정보를 제거합니다. */
  const clearSelectedShop = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("shopId");

    router.replace(
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname,
      {
        scroll: false,
      },
    );
  }, [pathname, router, searchParams]);

  /** 지도 마커나 검색 결과에서 상점을 선택합니다. */
  const selectShop = useCallback(
    (shopId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("shopId", shopId);

      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });

      setShopListSheetState("collapsed");
    },
    [pathname, router, searchParams, setShopListSheetState],
  );

  /** 검색어를 변경하고 기존 선택을 초기화합니다. */
  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    clearSelectedShop();
  };

  /** 모든 분류 조건을 해제합니다. */
  const handleShowAll = () => {
    setPickedOnly(false);
    setSelectedDetailedFilters([]);

    clearSelectedShop();
  };

  /** 사용자가 저장한 상점만 표시합니다. */
  const handleShowPicked = () => {
    setPickedOnly(true);
    setSelectedDetailedFilters([]);

    clearSelectedShop();
  };

  /** 상세 태그 필터 하나를 추가하거나 제거합니다. */
  const handleToggleDetailedFilter = useCallback(
    (filter: MapTagFilter) => {
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
    },
    [clearSelectedShop],
  );

  /** 상세 필터 시트를 엽니다. */
  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  /** 상세 필터 시트를 닫습니다. */
  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  /** 지도 검색 시트를 엽니다. */
  const handleOpenSearch = () => {
    setShopListSheetState("collapsed");
    setIsSearchOpen(true);
  };

  /** 검색 결과에서 상점을 선택합니다. */
  const handleSelectSearchResult = useCallback(
    (shopId: string) => {
      selectShop(shopId);
      setIsSearchOpen(false);
    },
    [selectShop],
  );

  /** 검색 시트의 열림 상태를 변경합니다. */
  const handleSearchOpenChange = (open: boolean) => {
    setShopListSheetState("collapsed");
    setIsSearchOpen(open);
  };

  /** 선택 상점을 해제하고 목록으로 돌아갑니다. */
  const handleShowShopList = useCallback(() => {
    clearSelectedShop();
    setShopListSheetState("collapsed");
  }, [clearSelectedShop, setShopListSheetState]);

  /** 모든 검색 및 필터 조건을 초기화합니다. */
  const resetFilters = useCallback(() => {
    setKeyword("");
    setPickedOnly(false);
    setSelectedDetailedFilters([]);

    clearSelectedShop();
  }, [clearSelectedShop]);

  return {
    keyword,
    debouncedKeyword,
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
  };
}
