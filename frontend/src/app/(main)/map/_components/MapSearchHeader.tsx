"use client";

import { useRouter } from "next/navigation";

import { ChevronLeftIcon, FilterIcon } from "@/components/icons";
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
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <SearchInput
        value={keyword}
        onValueChange={onKeywordChange}
        placeholder="상점 이름 검색"
        aria-label="상점 이름 검색"
        leftAction={
          <button
            type="button"
            aria-label="지도 나가기"
            onClick={() => router.back()}
            className="
              flex size-7
              items-center justify-center
              rounded-full
              text-black-950
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-black-950
            "
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        }
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
          shadow-[0_0_10px_1px]
          shadow-black-950/10
        "
      >
        <FilterIcon className="size-6 text-black-950" />
      </Button>
    </div>
  );
}
