"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";

import type { MapShop } from "../_types/map.types";

type MapSearchSheetProps = Readonly<{
  open: boolean;
  keyword: string;
  shops: MapShop[];
  onKeywordChange: (keyword: string) => void;
  onSelectShop: (shopId: string) => void;
  onOpenChange: (open: boolean) => void;
}>;

/** 검색어와 일치하는 상점을 큰 검색 시트 안에서 탐색하게 합니다. */
export function MapSearchSheet({
  open,
  keyword,
  shops,
  onKeywordChange,
  onSelectShop,
  onOpenChange,
}: MapSearchSheetProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  /** 대화상자가 열린 뒤 검색 입력창으로 시작 포커스를 옮깁니다. */
  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="map-search-title"
      showCloseButton
      closeButtonLabel="상점 검색 닫기"
      className="min-h-[calc(100dvh-1.25rem)] rounded-t-[20px] bg-white"
    >
      <BottomSheet.Handle />
      <BottomSheet.Header>
        <BottomSheet.Title id="map-search-title">상점 검색</BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        <SearchInput
          ref={searchInputRef}
          value={keyword}
          onValueChange={onKeywordChange}
          aria-label="검색할 상점 입력"
          placeholder="상점 이름, 지역, 태그 검색"
          className="bg-black-100! shadow-none! hover:shadow-none!"
        />

        <p className="mt-6 text-14 font-semibold text-black-700">
          검색 결과 <span className="text-green-700">{shops.length}</span>
        </p>

        {shops.length === 0 ? (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <p className="font-semibold">검색 결과가 없어요</p>
              <p className="mt-1 text-13 text-black-500">
                다른 이름이나 지역으로 검색해 주세요.
              </p>
            </div>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-black-100">
            {shops.map((shop, index) => (
              <li key={shop.id}>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => onSelectShop(shop.id)}
                  className="h-auto! justify-start! rounded-none! px-0! py-3! text-left!"
                >
                  <div className="flex gap-3">
                    <Image
                      src={shop.imageUrl}
                      alt=""
                      width={48}
                      height={48}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="size-12 shrink-0 rounded-xl object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-15 font-semibold">
                        {shop.name}
                      </span>
                      <span className="mt-1 block truncate text-12 font-normal text-black-500">
                        {shop.address}
                      </span>
                    </span>
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet.Body>
    </BottomSheet>
  );
}
