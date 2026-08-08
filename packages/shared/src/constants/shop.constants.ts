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
