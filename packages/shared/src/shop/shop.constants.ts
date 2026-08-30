import type { ShopRegionGroup } from "./shop.types";

export const SHOP_CATEGORIES = ["소품샵", "가챠샵", "굿즈샵"] as const;

export const SHOP_STATUSES = [
  "active",
  "temporarily_closed",
  "closed",
  "hidden",
] as const;

export const SHOP_STATUS_LABELS = {
  active: "운영중",
  temporarily_closed: "휴업",
  closed: "폐업",
  hidden: "숨김",
} as const;

export const SHOP_SORTS = ["latest", "distance", "popular"] as const;

export const SHOP_SOURCE_TYPES = [
  "admin",
  "official",
  "user_suggestion",
  "public_data",
] as const;

export const SHOP_IMAGE_SOURCE_TYPES = [
  "official",
  "user",
  "admin",
  "public_data",
  "etc",
] as const;

export const SHOP_REGION_GROUPS = [
  "seongsu-seoulforest",
  "hongdae-yeonnam",
  "mangwon",
  "seochon",
] as const;

export const SHOP_REGION_GROUP_LABELS: Record<ShopRegionGroup, string> = {
  "seongsu-seoulforest": "성수·서울숲",
  "hongdae-yeonnam": "홍대·연남",
  mangwon: "망원",
  seochon: "서촌",
};
