"use client";

import Image from "next/image";
import Link from "next/link";

import { LocationIcon, MenuIcon } from "@/components/icons";
import { PickAction } from "@/components/pick/PickAction";
import { PickButton } from "@/components/pick/PickButton";
import { Button } from "@/components/ui/Button";

import type { MapShop } from "@/components/naver-map";
import { getMapTagLabel } from "../_mappers/mapTagLabel";

type MapSelectedShopCardProps = Readonly<{
  shop: MapShop;
  onShowList: () => void;
}>;

/** 지도에서 선택한 상점과 목록 복귀 동작을 한곳에 표시합니다. */
export function MapSelectedShopCard({
  shop,
  onShowList,
}: MapSelectedShopCardProps) {
  return (
    <section
      aria-label="선택한 상점"
      className="absolute inset-x-4 bottom-4 z-30"
    >
      <div className="mb-2 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="small"
          leftIcon={<MenuIcon />}
          onClick={onShowList}
          className="
              rounded-full!
              border-stroke-subtle!
              bg-surface-primary!
              shadow-card
            "
        >
          목록보기
        </Button>
      </div>

      <div
        className="
          relative rounded-card
          bg-surface-primary p-3
          shadow-floating
        "
      >
        <Link
          href={`/shops/${shop.id}`}
          className="
              flex gap-3 rounded-card pr-9
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-brand
            "
        >
          <Image
            src={shop.imageUrl}
            alt={`${shop.name} 매장 이미지`}
            width={112}
            height={112}
            loading="eager"
            className="size-28 shrink-0 rounded-control object-cover"
          />

          <span className="min-w-0 flex-1 py-1">
            <span className="block truncate text-17 font-semibold text-fg-primary">
              {shop.name}
            </span>

            <span className="mt-3 block truncate text-12 text-fg-tertiary">
              {shop.address}
            </span>

            <span className="mt-1 flex items-center gap-1 text-12 text-fg-brand">
              <LocationIcon className="size-3.5" />
              {shop.regionGroup}
            </span>
            <span className="mt-3 flex gap-1 overflow-hidden">
              {shop.tags.map((tag) => (
                <span
                  key={tag}
                  className="
                    shrink-0 rounded-full
                    bg-brand-soft-strong
                    px-2 py-1
                    text-10 text-green-900
                  "
                >
                  #{getMapTagLabel(tag)}
                </span>
              ))}
            </span>
          </span>
        </Link>

        <PickAction shopId={shop.id} initialIsLiked={shop.isLiked}>
          {({ isLiked, isPending, onToggle }) => (
            <PickButton
              isLiked={isLiked}
              isPending={isPending}
              onToggleLike={onToggle}
              className="absolute right-1 top-1 z-20"
            />
          )}
        </PickAction>
      </div>
    </section>
  );
}
