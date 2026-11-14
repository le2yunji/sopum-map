"use client";

import Image from "next/image";
import Link from "next/link";

import { SHOP_REGION_GROUP_LABELS } from "@sopum-map/shared";
import type { ShopListItem } from "@sopum-map/shared";

import { EllipsisVerticalIcon } from "@/components/icons";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

export type PickShop = Pick<
  ShopListItem,
  "id" | "name" | "mainImageUrl" | "regionGroup" | "category"
>;

type Props = Readonly<{
  shop: PickShop;
  imageLoading?: "eager" | "lazy";
  onChangeFolder: (shopId: string) => void;
}>;

/** 상점 정보와 폴더 이동 메뉴를 서로 겹치지 않는 영역으로 표시합니다. */
export function PickShopCard({
  shop,
  imageLoading = "lazy",
  onChangeFolder,
}: Props) {
  const imageUrl = shop.mainImageUrl ?? DEFAULT_SHOP_IMAGE;

  return (
    <article className="min-w-0">
      <Link
        href={`/shops/${shop.id}`}
        aria-label={`${shop.name} 상세 보기`}
        className="
          group block rounded-card
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-brand
        "
      >
        <div
          className="
            relative aspect-square
            overflow-hidden rounded-card
            bg-surface-muted
          "
        >
          <Image
            fill
            src={imageUrl}
            alt={`${shop.name} 매장 이미지`}
            sizes="(max-width: 480px) calc((100vw - 52px) / 2), 214px"
            loading={imageLoading}
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        </div>
      </Link>

      <div className="mt-3 flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-15 font-medium text-fg-primary">
            {shop.name}
          </h2>

          <div className="mt-1 flex items-center gap-2 text-12">
            <span className="truncate text-fg-tertiary">
              {SHOP_REGION_GROUP_LABELS[shop.regionGroup]}
            </span>

            <span
              className="
                shrink-0 rounded-full
                bg-brand-soft-strong
                px-2 py-0.5
                text-green-900
              "
            >
              {shop.category}
            </span>
          </div>
        </div>

        <PickShopFolderButton
          shopId={shop.id}
          shopName={shop.name}
          onChangeFolder={onChangeFolder}
        />
      </div>
    </article>
  );
}

type PickShopFolderButtonProps = Readonly<{
  shopId: string;
  shopName: string;
  onChangeFolder: (shopId: string) => void;
}>;

/** 선택한 상점의 폴더 이동 바텀시트를 바로 엽니다. */
function PickShopFolderButton({
  shopId,
  shopName,
  onChangeFolder,
}: PickShopFolderButtonProps) {
  return (
    <button
      type="button"
      aria-label={`${shopName} 폴더 이동`}
      aria-haspopup="dialog"
      onClick={() => {
        onChangeFolder(shopId);
      }}
      className="
        -mr-2 -mt-2
        grid size-11 shrink-0 place-items-center
        rounded-full text-black-500
        hover:bg-black-100
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-green-700
      "
    >
      <EllipsisVerticalIcon className="size-5" aria-hidden="true" />
    </button>
  );
}
