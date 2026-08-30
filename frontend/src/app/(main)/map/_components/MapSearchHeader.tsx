"use client";

import type { KeyboardEvent } from "react";

import { BackButton } from "@/components/navigation/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";

type MapSearchHeaderProps = Readonly<{
  keyword: string;
  isSearchOpen: boolean;
  onOpenSearch: () => void;
}>;

export function MapSearchHeader({
  keyword,
  isSearchOpen,
  onOpenSearch,
}: MapSearchHeaderProps) {
  /** 읽기 전용 검색창을 키보드에서도 검색 시트 트리거로 동작시킵니다. */
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpenSearch();
  };

  return (
    <div className="flex items-center gap-2">
      <SearchInput
        value={keyword}
        readOnly
        placeholder="상점 이름 검색"
        aria-label="상점 이름 검색"
        aria-haspopup="dialog"
        aria-expanded={isSearchOpen}
        onClick={onOpenSearch}
        onKeyDown={handleSearchKeyDown}
        className="[&_input]:cursor-pointer"
        leftAction={
          <BackButton
            ariaLabel="지도 나가기"
            className="size-7! min-h-0! text-black-950"
          />
        }
      />
    </div>
  );
}
