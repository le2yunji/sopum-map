import type { TagKey } from "./tag.types";

export const TAG_GROUPS = ["product", "mood", "experience"] as const;

export const TAG_GROUP_LABELS = {
  product: "소품",
  mood: "분위기",
  experience: "방문 경험",
} as const satisfies Record<(typeof TAG_GROUPS)[number], string>;

export const TAG_DEFINITIONS = [
  { key: "keyrings", label: "키링", group: "product", isActive: true },
  { key: "stickers", label: "스티커", group: "product", isActive: true },
  { key: "diary_supplies", label: "다꾸템", group: "product", isActive: true },
  { key: "plush", label: "인형", group: "product", isActive: true },
  { key: "figures", label: "피규어", group: "product", isActive: true },
  { key: "gacha", label: "가챠", group: "product", isActive: true },
  { key: "sanrio", label: "산리오", group: "product", isActive: true },
  { key: "shinchan", label: "짱구", group: "product", isActive: true },
  { key: "indie_artist", label: "작가 소품", group: "product", isActive: true },
  { key: "trend_item", label: "유행템", group: "product", isActive: true },
  { key: "stationery", label: "문구", group: "product", isActive: true },
  { key: "interior", label: "인테리어 소품", group: "product", isActive: true },
  { key: "cute", label: "아기자기", group: "mood", isActive: true },
  { key: "vintage", label: "빈티지", group: "mood", isActive: true },
  { key: "kitsch", label: "키치", group: "mood", isActive: true },
  { key: "hip", label: "힙한", group: "mood", isActive: true },
  { key: "lovely", label: "러블리", group: "mood", isActive: true },
  { key: "cozy", label: "포근한 감성", group: "mood", isActive: true },
  {
    key: "good_for_gifts",
    label: "선물 추천",
    group: "experience",
    isActive: true,
  },
  { key: "friendly", label: "친절한", group: "experience", isActive: true },
  { key: "spacious", label: "넓고 쾌적", group: "experience", isActive: true },
  { key: "good_value", label: "가성비", group: "experience", isActive: true },
  {
    key: "lots_to_see",
    label: "볼거리 많은",
    group: "experience",
    isActive: true,
  },
  {
    key: "impulse_buying",
    label: "충동구매 유발",
    group: "experience",
    isActive: true,
  },
] as const satisfies readonly {
  key: string;
  label: string;
  group: (typeof TAG_GROUPS)[number];
  isActive: boolean;
}[];

export const TAG_KEYS = TAG_DEFINITIONS.map((tag) => tag.key);

export const ACTIVE_TAG_DEFINITIONS = TAG_DEFINITIONS.filter(
  (tag) => tag.isActive,
);

export const TAG_DEFINITION_BY_KEY = Object.fromEntries(
  TAG_DEFINITIONS.map((tag) => [tag.key, tag]),
) as {
  [K in TagKey]: Extract<(typeof TAG_DEFINITIONS)[number], { key: K }>;
};
