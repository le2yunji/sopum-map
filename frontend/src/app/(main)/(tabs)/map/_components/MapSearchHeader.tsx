"use client";

import { FilterIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";

type MapSearchHeaderProps = Readonly<{
  keyword: string;
  isFilterOpen: boolean;
  onKeywordChange: (value: string) => void;
  onOpenFilter: () => void;
}>;

export function MapSearchHeader({
  keyword,
  isFilterOpen,
  onKeywordChange,
  onOpenFilter,
}: MapSearchHeaderProps) {
  return (
    <div className="flex gap-2">
      <SearchInput
        value={keyword}
        onValueChange={onKeywordChange}
        placeholder="상점 이름 검색"
        aria-label="상점 이름 검색"
      />

      <Button
        type="button"
        variant="ghost"
        size="medium"
        iconOnly
        aria-label="상세 필터 열기"
        aria-expanded={isFilterOpen}
        onClick={onOpenFilter}
        className="
          shrink-0 rounded-full bg-white
          shadow-[0_0_10px_1px] shadow-black-950/10
        "
      >
        <FilterIcon className="size-6 text-black-950" />
      </Button>
    </div>
  );
}
