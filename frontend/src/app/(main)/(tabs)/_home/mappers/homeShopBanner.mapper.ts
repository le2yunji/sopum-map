import type { HomeCuratedShop } from "@sopum-map/shared";

import { SHOP_REGION_GROUP_LABELS, TAG_SHORT_LABELS } from "@sopum-map/shared";

import type { ShopBannerItem } from "@/components/ui/ShopBannerCarousel/ShopBannerCarousel.types";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

export const toShopBannerItem = (shop: HomeCuratedShop): ShopBannerItem => {
  return {
    id: shop.shopId,
    href: `/shops/${shop.shopId}`,

    name: shop.name,

    imageUrl: shop.mainImageUrl ?? DEFAULT_SHOP_IMAGE,

    imageAlt: `${shop.name} 매장 이미지`,

    region: SHOP_REGION_GROUP_LABELS[shop.regionGroup],

    curatorText: shop.curatorText ?? "",

    description: shop.description ?? "",

    tags: shop.tags.map((tag) => ({
      id: tag.key,
      name: TAG_SHORT_LABELS[tag.key],
    })),
  };
};
