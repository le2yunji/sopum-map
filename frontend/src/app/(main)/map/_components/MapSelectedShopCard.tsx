"use client";

import Image from "next/image";
import Link from "next/link";

import { HeartIcon, LocationIcon, MenuIcon } from "@/components/icons";
import { PickAction } from "@/components/pick/PickAction";
import { Button } from "@/components/ui/Button";

import type { MapShop } from "../_types/map.types";

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
          className="rounded-full! border-black-100! bg-white! shadow-md"
        >
          목록보기
        </Button>
      </div>

      <div className="relative rounded-2xl bg-white p-3 shadow-lg">
        <Link
          href={`/shops/${shop.id}`}
          className="flex gap-3 rounded-xl pr-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <Image
            src={shop.imageUrl}
            alt={`${shop.name} 매장 이미지`}
            width={112}
            height={112}
            loading="eager"
            className="size-28 shrink-0 rounded-xl object-cover"
          />

          <span className="min-w-0 flex-1 py-1">
            <span className="block truncate text-17 font-semibold">
              {shop.name}
            </span>
            <span className="mt-3 block truncate text-12 text-black-500">
              {shop.address}
            </span>
            <span className="mt-1 flex items-center gap-1 text-12 text-green-700">
              <LocationIcon className="size-3.5" />
              {shop.regionGroup}
            </span>
            <span className="mt-3 flex gap-1 overflow-hidden">
              {shop.tags.map((tag) => (
                <span
                  key={tag}
                  className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-10 text-green-900"
                >
                  #{tag}
                </span>
              ))}
            </span>
          </span>
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
              className="absolute right-1 top-1 hover:bg-transparent! active:bg-transparent!"
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
      </div>
    </section>
  );
}
