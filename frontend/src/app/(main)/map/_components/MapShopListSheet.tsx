"use client";

import { Button } from "@/components/ui/Button/Button";
import type { MapShop } from "../_types/map.types";
import { MapShopList } from "./MapShopList";
import {
  EXPANDED_TOP_OFFSET,
  useMapShopListSheetGesture,
  type MapShopListSheetState,
} from "../_hooks/mapShopListSheet";

type MapShopListSheetProps = Readonly<{
  /** 현재 실제로 렌더링할 상점 */
  shops: MapShop[];

  /** 필터 조건에 해당하는 전체 상점 개수 */
  totalCount: number;

  visible?: boolean;

  state: MapShopListSheetState;

  selectedRegionLabel?: string;

  selectedTagCount: number;

  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean;

  /** 다음 페이지 로딩 여부 */
  isLoadingMore: boolean;

  /** 다음 페이지 요청 */
  onLoadMore: () => void;

  onStateChange: (state: MapShopListSheetState) => void;

  onResetFilters: () => void;
}>;

/** 지도 위에서 접힘·펼침이 가능한 상점 목록을 조합합니다. */
export function MapShopListSheet({
  shops,
  totalCount,
  visible = true,
  state,
  selectedRegionLabel,
  selectedTagCount,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  onStateChange,
  onResetFilters,
}: MapShopListSheetProps) {
  const isExpanded = state === "expanded";

  const {
    sheetRef,
    listRef,
    initialTransform,
    toggleSheet,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleListClickCapture,
  } = useMapShopListSheetGesture({
    visible,
    state,
    onStateChange,
  });

  return (
    <section
      ref={sheetRef}
      aria-label="검색된 소품샵"
      aria-hidden={!visible}
      inert={!visible}
      style={{
        height: `calc(100% - ${EXPANDED_TOP_OFFSET}px)`,
        transform: initialTransform,
      }}
      className="
        absolute inset-x-0 bottom-0 z-9999
        overflow-hidden
        rounded-t-3xl
        bg-white
        shadow-[0_-6px_16px_rgba(0,0,0,0.08)]
      "
    >
      <button
        type="button"
        aria-label={isExpanded ? "상점 목록 접기" : "상점 목록 펼치기"}
        aria-expanded={isExpanded}
        onClick={toggleSheet}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="
          block w-full
          cursor-grab
          touch-none
          select-none
          px-4
          pb-2
          pt-3
          text-left
          active:cursor-grabbing
        "
      >
        <span
          aria-hidden="true"
          className="
            mx-auto mb-3 block
            h-1 w-10
            rounded-full
            bg-black-300
          "
        />

        <span className="flex items-center justify-between">
          <span className="font-semibold">
            {selectedRegionLabel ? `${selectedRegionLabel} ` : "주변 "}

            <span className="text-green-600">{totalCount}</span>
          </span>

          {selectedTagCount > 0 && (
            <span className="text-12 text-black-500">
              태그 {selectedTagCount}개 적용
            </span>
          )}
        </span>
      </button>

      {totalCount === 0 ? (
        <div
          role="status"
          className="
            grid h-32
            place-items-center
            px-4
            text-center
          "
        >
          <div>
            <p className="font-semibold">조건에 맞는 상점이 없어요</p>

            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={onResetFilters}
              className="mt-2"
            >
              필터 초기화
            </Button>
          </div>
        </div>
      ) : (
        <MapShopList
          shops={shops}
          listRef={listRef}
          onClickCapture={handleListClickCapture}
          onLoadMore={onLoadMore}
          hasNextPage={hasNextPage}
          isLoading={isLoadingMore}
        />
      )}
    </section>
  );
}
