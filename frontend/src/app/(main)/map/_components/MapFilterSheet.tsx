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
      showCloseButton
      closeButtonLabel="필터 닫기"
    >
      <BottomSheet.Header>
        <BottomSheet.Title id="map-filter-title">태그 필터</BottomSheet.Title>
      </BottomSheet.Header>

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
                      variant="outline"
                      size="small"
                      aria-pressed={isSelected}
                      onClick={() => onToggleFilter(filter)}
                      className={`
                        rounded-full
                        ${
                          isSelected
                            ? "border-green-700 bg-green-100 text-black-950"
                            : ""
                        }
                      `}
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

      <BottomSheet.Footer>
        <Button
          type="button"
          variant="primary"
          size="large"
          fullWidth
          onClick={onClose}
        >
          {selectedFilters.length
            ? `${selectedFilters.length}개 태그 적용`
            : "전체 상점 보기"}
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
