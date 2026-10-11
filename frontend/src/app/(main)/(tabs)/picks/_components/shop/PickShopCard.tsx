import Image from "next/image";
import Link from "next/link";
import { SHOP_REGION_GROUP_LABELS } from "@sopum-map/shared";
import type { ShopListItem } from "@sopum-map/shared";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

export type PickShop = Pick<
  ShopListItem,
  "id" | "name" | "mainImageUrl" | "regionGroup" | "category"
>;

type Props = Readonly<{
  shop: PickShop;
}>;

export function PickShopCard({ shop }: Props) {
  const imageUrl = shop.mainImageUrl ?? DEFAULT_SHOP_IMAGE;

  return (
    <article className="min-w-0">
      <Link
        href={`/shops/${shop.id}`}
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
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        </div>

        <h2 className="mt-3 truncate text-15 font-medium text-fg-primary">
          {shop.name}
        </h2>

        <div className="mt-1 flex items-center gap-2 text-12">
          <span className="truncate text-fg-tertiary">
            {SHOP_REGION_GROUP_LABELS[shop.regionGroup]}
          </span>

          <span
            className="
              rounded-full
              bg-brand-soft-strong
              px-2 py-0.5 
              text-green-900
            "
          >
            {shop.category}
          </span>
        </div>
      </Link>
    </article>
  );
}
