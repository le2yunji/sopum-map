// shop.types.ts

import type {
  SHOP_CATEGORIES,
  SHOP_IMAGE_SOURCE_TYPES,
  SHOP_SOURCE_TYPES,
  SHOP_STATUSES,
  SHOP_REGION_GROUPS,
} from "./shop.constants";

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export type ShopStatus = (typeof SHOP_STATUSES)[number];

export type ShopSourceType = (typeof SHOP_SOURCE_TYPES)[number];

export type ShopImageSourceType = (typeof SHOP_IMAGE_SOURCE_TYPES)[number];

export type ShopRegionGroup = (typeof SHOP_REGION_GROUPS)[number];
