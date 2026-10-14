"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { useInfiniteShops } from "@/api/shops/shop.query";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DEFAULT_IMAGES } from "@/constants/image.constants";
import { VisitLogCreateScreen } from "../../../shops/[shopId]/visit-logs/new/_components/VisitLogCreateScreen";

/** 상점 정보 없이 들어온 사용자가 기록할 상점을 검색하고 선택하게 합니다. */
export function VisitLogEntryScreen() {
  const [keyword, setKeyword] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string>();
  const normalizedKeyword = keyword.trim();
  const shopsQuery = useInfiniteShops(
    { keyword: normalizedKeyword || undefined, limit: 20 },
    normalizedKeyword.length > 0,
  );
  const shops = useMemo(
    () => shopsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [shopsQuery.data],
  );

  if (selectedShopId) {
    return (
      <VisitLogCreateScreen
        shopId={selectedShopId}
        onBackOverride={() => setSelectedShopId(undefined)}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-white px-5 pt-6 pb-10">
      <h1 className="text-20 font-semibold">방문한 소품샵 찾기</h1>
      <p className="mt-1 text-13 text-black-500">
        방문 로그를 남길 소품샵을 검색해 주세요.
      </p>

      <SearchInput
        value={keyword}
        onValueChange={setKeyword}
        aria-label="방문한 소품샵 검색"
        placeholder="상점 이름이나 지역 검색"
        className="mt-5"
      />

      {normalizedKeyword.length === 0 ? (
        <p className="mt-10 text-center text-14 text-black-500">
          상점 이름을 입력하면 검색 결과가 표시됩니다.
        </p>
      ) : shopsQuery.isPending ? (
        <p role="status" className="mt-10 text-center text-14 text-black-500">
          상점을 찾고 있습니다.
        </p>
      ) : shopsQuery.isError ? (
        <div className="mt-10 text-center">
          <p className="text-14 text-red-600">상점을 불러오지 못했습니다.</p>
          <Button variant="outline" className="mt-3" onClick={() => void shopsQuery.refetch()}>
            다시 시도
          </Button>
        </div>
      ) : shops.length === 0 ? (
        <p className="mt-10 text-center text-14 text-black-500">검색 결과가 없습니다.</p>
      ) : (
        <ul className="mt-5 divide-y divide-black-100">
          {shops.map((shop, index) => (
            <li key={shop.id}>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => setSelectedShopId(shop.id)}
                className="h-auto! justify-start! rounded-none! px-0! py-3! text-left!"
              >
                <Image
                  src={shop.mainImageUrl ?? DEFAULT_IMAGES.shop}
                  alt=""
                  width={48}
                  height={48}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="size-12 shrink-0 rounded-xl object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-15 font-semibold">{shop.name}</span>
                  <span className="mt-1 block truncate text-12 font-normal text-black-500">
                    {shop.address}
                  </span>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
