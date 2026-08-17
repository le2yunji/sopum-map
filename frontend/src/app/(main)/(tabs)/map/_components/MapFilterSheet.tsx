"use client";

import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";

import { MAP_TAGS } from "../_constants/map.constants";

type MapFilterSheetProps = Readonly<{
  open: boolean;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClose: () => void;
}>;

export function MapFilterSheet({
  open,
  selectedTags,
  onToggleTag,
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
        <div className="mt-5 flex flex-wrap gap-2">
          {MAP_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <Button
                key={tag}
                type="button"
                variant="outline"
                size="small"
                aria-pressed={isSelected}
                onClick={() => onToggleTag(tag)}
                className={`
                  rounded-full
                  ${
                    isSelected
                      ? "border-green-700 bg-green-100 text-black-950"
                      : ""
                  }
                `}
              >
                # {tag}
              </Button>
            );
          })}
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
          {selectedTags.length
            ? `${selectedTags.length}개 태그 적용`
            : "전체 상점 보기"}
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
