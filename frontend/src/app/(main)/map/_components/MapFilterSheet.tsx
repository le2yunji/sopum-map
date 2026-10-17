"use client";

import type { TagKey } from "@sopum-map/shared";

import { TagQuestionList } from "@/components/tag/TagQuestionList";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";

type MapFilterSheetProps = Readonly<{
  open: boolean;
  selectedTagKeys: readonly TagKey[];
  onToggleTag: (tagKey: TagKey) => void;
  onClose: () => void;
}>;

export function MapFilterSheet({
  open,
  selectedTagKeys,
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
        <TagQuestionList
          selectedTagKeys={selectedTagKeys}
          onToggleTag={onToggleTag}
          displayMode="categories"
        />
      </BottomSheet.Body>

      <BottomSheet.Footer>
        <Button
          type="button"
          variant="primary"
          size="large"
          fullWidth
          onClick={onClose}
        >
          {selectedTagKeys.length
            ? `${selectedTagKeys.length}개 태그 적용`
            : "전체 상점 보기"}
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
}
