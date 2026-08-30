"use client";

import { FilterChipGroup } from "@/components/ui/FilterChipGroup/FilterChipGroup";
import { HeartIcon, StoreIcon, TagIcon } from "@/components/icons";

type MapTagFilterChipsProps = Readonly<{
  pickedOnly: boolean;
  hasDetailedFilters: boolean;
  onShowAll: () => void;
  onShowPicked: () => void;
  onOpenTags: () => void;
}>;

const ALL_VALUE = "all";
const PICKED_VALUE = "picked";
const TAG_VALUE = "tag";

/** 전체 상점, 내 픽, 태그 상세 필터의 세 가지 지도 탐색 동작을 표시합니다. */
export function MapTagFilterChips({
  pickedOnly,
  hasDetailedFilters,
  onShowAll,
  onShowPicked,
  onOpenTags,
}: MapTagFilterChipsProps) {
  const items = [
    {
      value: ALL_VALUE,
      label: "전체",
      icon: <StoreIcon className="size-5" aria-hidden="true" />,
    },
    {
      value: PICKED_VALUE,
      label: "내 픽",
      icon: <HeartIcon className="size-5" aria-hidden="true" />,
    },
    {
      value: TAG_VALUE,
      label: "태그",
      icon: <TagIcon className="size-5" />,
    },
  ];

  const selectedValue = pickedOnly
    ? PICKED_VALUE
    : hasDetailedFilters
      ? TAG_VALUE
      : ALL_VALUE;

  /** 선택한 칩을 각 필터 동작으로 연결합니다. */
  const handleValueChange = (value: string) => {
    if (value === ALL_VALUE) {
      onShowAll();
      return;
    }

    if (value === PICKED_VALUE) {
      onShowPicked();
      return;
    }

    if (value === TAG_VALUE) {
      onOpenTags();
    }
  };

  return (
    <FilterChipGroup
      items={items}
      selectedValue={selectedValue}
      ariaLabel="지도 상점 필터"
      onValueChange={handleValueChange}
    />
  );
}
