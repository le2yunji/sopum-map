"use client";

import Image from "next/image";
import Link from "next/link";

import type { MouseEventHandler, RefObject } from "react";

import { HeartIcon, LocationIcon } from "@/components/icons";
import { PickAction } from "@/components/pick/PickAction";
import { Button } from "@/components/ui/Button/Button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import type { MapShop } from "../_types/map.types";

type MapShopListProps = Readonly<{
  shops: MapShop[];

  listRef: RefObject<HTMLUListElement | null>;

  onClickCapture: MouseEventHandler<HTMLUListElement>;

  /** 다음 페이지 데이터를 불러옵니다. */
  onLoadMore: () => void;

  /** 다음 페이지 존재 여부입니다. */
  hasNextPage: boolean;

  /** 다음 페이지 로딩 여부입니다. */
  isLoading: boolean;
}>;

/** 지도 목록의 상점 정보와 개별 찜 동작을 렌더링합니다. */
export function MapShopList({
  shops,
  listRef,
  onClickCapture,
  onLoadMore,
  hasNextPage,
  isLoading,
}: MapShopListProps) {
  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore,
    hasNextPage,
    isLoading,
    rootRef: listRef,
  });

  return (
    <ul
      ref={listRef}
      onClickCapture={onClickCapture}
      className="
        h-[calc(100%_-_60px)]
        overflow-y-auto
        overscroll-y-contain
        px-4
        divide-y divide-black-100
        [-webkit-overflow-scrolling:touch]
      "
    >
      {shops.map((shop, index) => (
        <li key={shop.id} className="relative">
          <Link
            href={`/shops/${shop.id}`}
            className="
                flex gap-3
                py-3
                pr-10
                focus-visible:outline-2
                focus-visible:outline-green-700
              "
          >
            <Image
              src={shop.imageUrl}
              alt={`${shop.name} 매장 이미지`}
              width={80}
              height={80}
              loading={index === 0 ? "eager" : "lazy"}
              className="
                  size-20
                  shrink-0
                  rounded-xl
                  object-cover
                "
            />

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-16 font-semibold">{shop.name}</h3>

              <p className="mt-1 truncate text-12 text-black-500">
                {shop.address}
              </p>

              <p className="mt-1 flex items-center gap-1 text-12 text-green-700">
                <LocationIcon className="size-3.5" />

                {shop.regionGroup}
              </p>

              <div className="mt-2 flex flex-wrap gap-1">
                {shop.tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                          rounded-full
                          bg-green-100
                          px-2 py-1
                          text-10
                          text-green-900
                        "
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          <PickAction shopId={shop.id} initialIsPicked={shop.isLiked}>
            {({ isPicked, onToggle }) => (
              <Button
                type="button"
                iconOnly
                size="small"
                variant="ghost"
                aria-label={isPicked ? "내 픽에서 제거" : "내 픽에 추가"}
                aria-pressed={isPicked}
                onClick={() => void onToggle()}
                className="
                    absolute
                    right-1
                    top-2
                    hover:bg-transparent!
                    active:bg-transparent!
                  "
              >
                <HeartIcon
                  filled={isPicked}
                  className={
                    isPicked
                      ? "size-6! text-red-600 [&_path]:stroke-[2]"
                      : "size-6! text-black-300 [&_path]:stroke-[1.5]"
                  }
                />
              </Button>
            )}
          </PickAction>
        </li>
      ))}

      {hasNextPage && (
        <li ref={loadMoreRef} aria-hidden="true" className="h-px" />
      )}

      {isLoading && (
        <li
          role="status"
          className="
            py-4
            text-center
            text-12
            text-black-500
          "
        >
          불러오는 중...
        </li>
      )}
    </ul>
  );
}
