"use client";

import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";

import {
  getMapTagFilterValue,
  MAP_TAG_FILTER_GROUPS,
  type MapTagFilter,
} from "../_constants/map.constants";

type MapFilterSheetProps = Readonly<{
  open: boolean;
  selectedFilters: readonly MapTagFilter[];
  onToggleFilter: (filter: MapTagFilter) => void;
  onClose: () => void;
}>;

export function MapFilterSheet({
  open,
  selectedFilters,
  onToggleFilter,
  onClose,
}: MapFilterSheetProps) {
  /** 공용 BottomSheet의 제어 상태를 지도 화면의 닫기 동작으로 연결합니다. */
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      ariaLabelledBy="map-filter-title"
    >
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-4 border-b border-black-100 bg-white px-6 py-4">
        <BottomSheet.Header className="mt-0!">
          <BottomSheet.Title id="map-filter-title">태그 필터</BottomSheet.Title>
        </BottomSheet.Header>

        <Button type="button" variant="primary" size="small" onClick={onClose}>
          {selectedFilters.length
            ? `${selectedFilters.length}개 태그 적용`
            : "태그 적용"}
        </Button>
      </div>

      <BottomSheet.Body>
        <div className="space-y-7 py-5">
          {MAP_TAG_FILTER_GROUPS.map((group) => (
            <section key={group.value} aria-labelledby={`tag-group-${group.value}`}>
              <h3
                id={`tag-group-${group.value}`}
                className="text-14 font-semibold text-black-700"
              >
                {group.label}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {group.filters.map((filter) => {
                  const filterValue = getMapTagFilterValue(filter);
                  const isSelected = selectedFilters.some(
                    (selectedFilter) =>
                      getMapTagFilterValue(selectedFilter) === filterValue,
                  );

                  return (
                    <Button
                      key={filterValue}
                      type="button"
                      variant={isSelected ? "primary" : "outline"}
                      size="small"
                      aria-pressed={isSelected}
                      onClick={() => onToggleFilter(filter)}
                      className="rounded-full"
                    >
                      #{filter.label}
                    </Button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </BottomSheet.Body>
    </BottomSheet>
  );
}
