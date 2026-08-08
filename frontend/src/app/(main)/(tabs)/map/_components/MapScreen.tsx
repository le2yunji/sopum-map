"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { SearchInput } from "@/components/ui/SearchInput/SearchInput";

import { MAP_CATEGORIES, MAP_TAGS } from "../_data/map.fixture";
import type { MapCategory, MapShop } from "../_types/map.types";
import { NaverMapCanvas } from "./NaverMapCanvas";

type MapScreenProps = {
  shops: MapShop[];
  mapSlot?: (props: {
    shops: MapShop[];
    selectedShopId?: string;
    onSelectShop: (shopId: string) => void;
  }) => ReactNode;
};

/** 검색어와 필터 조건에 맞는 상점만 반환합니다. */
function filterShops(shops: MapShop[], keyword: string, category: MapCategory, tags: string[]) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase("ko-KR");
  return shops.filter((shop) => {
    const matchesKeyword =
      !normalizedKeyword ||
      [shop.name, shop.address, shop.region, ...shop.tags]
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedKeyword);
    const matchesCategory = category === "all" || shop.category === category;
    const matchesTags = tags.length === 0 || tags.every((tag) => shop.tags.includes(tag));
    return matchesKeyword && matchesCategory && matchesTags;
  });
}

/** 지도, 필터, 마커와 상점 목록을 하나의 탐색 흐름으로 연결합니다. */
export function MapScreen({ shops, mapSlot }: MapScreenProps) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<MapCategory>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filteredShops = useMemo(
    () => filterShops(shops, keyword, category, selectedTags),
    [category, keyword, selectedTags, shops],
  );
  const selectShop = useCallback((shopId: string) => setSelectedShopId(shopId), []);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  return (
    <section aria-labelledby="map-heading" className="relative h-[calc(100dvh-65px)] min-h-[560px] overflow-hidden bg-green-50">
      <h1 id="map-heading" className="sr-only">소품샵 지도</h1>

      {mapSlot ? (
        mapSlot({ shops: filteredShops, selectedShopId, onSelectShop: selectShop })
      ) : (
        <NaverMapCanvas shops={filteredShops} selectedShopId={selectedShopId} onSelectShop={selectShop} />
      )}

      <div className="absolute inset-x-0 top-0 z-20 space-y-2 bg-gradient-to-b from-white/95 to-transparent px-4 pb-8 pt-3">
        <div className="flex gap-2">
          <SearchInput value={keyword} onValueChange={setKeyword} placeholder="상점 이름 검색" aria-label="상점 이름 검색" />
          <button
            type="button"
            aria-label="상세 필터 열기"
            aria-expanded={isFilterOpen}
            onClick={() => setIsFilterOpen(true)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-20 shadow-[0_0_10px_1px] shadow-black-950/10 focus-visible:outline-2"
          >
            ☷
          </button>
        </div>
        <div role="group" aria-label="상점 카테고리" className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {MAP_CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={category === item.value}
              onClick={() => setCategory(item.value)}
              className={`shrink-0 rounded-full border px-5 py-2 text-14 shadow-sm ${category === item.value ? "border-black-950 bg-black-950 text-white" : "border-black-100 bg-white text-black-800"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[270px] left-4 z-20 flex flex-col gap-2">
        <button type="button" aria-label="선택한 지역에서 검색" className="grid size-11 place-items-center rounded-full bg-white shadow-md">⌖</button>
        <button type="button" aria-label="현재 위치로 이동" className="grid size-11 place-items-center rounded-full bg-white shadow-md">◎</button>
      </div>

      <section aria-label="검색된 소품샵" className="absolute inset-x-0 bottom-0 z-30 h-[258px] rounded-t-3xl bg-white px-4 pb-3 pt-3 shadow-[0_-7px_10px_rgba(0,0,0,0.1)]">
        <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-black-300" />
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">주변 소품샵 <span className="text-green-600">{filteredShops.length}</span></h2>
          {selectedTags.length > 0 && <span className="text-12 text-black-500">태그 {selectedTags.length}개 적용</span>}
        </div>
        {filteredShops.length === 0 ? (
          <div role="status" className="grid h-40 place-items-center text-center">
            <div><p className="font-semibold">조건에 맞는 상점이 없음</p><button type="button" className="mt-2 text-14 text-green-700 underline" onClick={() => { setKeyword(""); setCategory("all"); setSelectedTags([]); }}>필터 초기화</button></div>
          </div>
        ) : (
          <ul className="h-[188px] divide-y divide-black-100 overflow-y-auto">
            {filteredShops.map((shop) => (
              <li key={shop.id} className={selectedShopId === shop.id ? "rounded-2xl bg-green-50" : ""}>
                <Link href={`/shops/${shop.id}`} onFocus={() => selectShop(shop.id)} className="flex gap-4 py-3 focus-visible:outline-2 focus-visible:outline-green-700">
                  <Image src={shop.imageUrl} alt={`${shop.name} 매장 이미지`} width={96} height={96} className="size-24 shrink-0 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1 py-1">
                    <div className="flex items-start justify-between gap-2"><h3 className="truncate text-18 font-medium">{shop.name}</h3><span aria-label={shop.isLiked ? "찜한 상점" : "찜하지 않은 상점"} className={shop.isLiked ? "text-red-600" : "text-black-300"}>♥</span></div>
                    <p className="mt-1 truncate text-12 text-black-500">{shop.address}</p>
                    <p className="mt-1 text-12 text-green-700">⌖ {shop.region}</p>
                    <div className="mt-2 flex gap-1">{shop.tags.map((tag) => <span key={tag} className="rounded-full bg-green-100 px-2 py-1 text-10 text-green-900">#{tag}</span>)}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isFilterOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="filter-title" className="absolute inset-0 z-40 flex items-end bg-black-950/35" onMouseDown={(event) => event.target === event.currentTarget && setIsFilterOpen(false)}>
          <div className="w-full rounded-t-3xl bg-white p-6 pb-8">
            <div className="flex items-center justify-between"><h2 id="filter-title" className="text-20 font-semibold">태그 필터</h2><button type="button" aria-label="필터 닫기" onClick={() => setIsFilterOpen(false)} className="size-11 text-20">×</button></div>
            <div className="mt-5 flex flex-wrap gap-2">{MAP_TAGS.map((tag) => <button key={tag} type="button" aria-pressed={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} className={`rounded-full border px-4 py-2 text-14 ${selectedTags.includes(tag) ? "border-green-700 bg-green-100" : "border-black-100"}`}>#{tag}</button>)}</div>
            <button type="button" onClick={() => setIsFilterOpen(false)} className="mt-6 h-12 w-full rounded-xl bg-green-600 font-semibold text-white">{selectedTags.length ? `${selectedTags.length}개 태그 적용` : "전체 상점 보기"}</button>
          </div>
        </div>
      )}
    </section>
  );
}
