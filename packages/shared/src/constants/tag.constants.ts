export const TAG_GROUPS = [
  "mood",
  "product",
  "character",
  "feature",
  "experience",
  "etc",
] as const;

export const TAG_DEFINITIONS = [
  {
    key: "cute",
    selectionLabel: "아기자기해요",
    shortLabel: "아기자기",
    group: "mood",
  },
  {
    key: "vintage",
    selectionLabel: "빈티지해요",
    shortLabel: "빈티지",
    group: "mood",
  },
  {
    key: "minimal",
    selectionLabel: "미니멀해요",
    shortLabel: "미니멀",
    group: "mood",
  },
  {
    key: "many_stationery",
    selectionLabel: "문구 종류가 다양해요",
    shortLabel: "문구 다양",
    group: "product",
  },
  {
    key: "character",
    selectionLabel: "캐릭터 상품이 다양해요",
    shortLabel: "캐릭터 다양",
    group: "product",
  },
  {
    key: "sanrio",
    selectionLabel: "산리오",
    shortLabel: "산리오",
    group: "character",
  },
  {
    key: "Shinchan",
    selectionLabel: "짱구는 못말려",
    shortLabel: "짱구는 못말려",
    group: "character",
  },
  {
    key: "good_for_gifts",
    selectionLabel: "선물하기 좋아요",
    shortLabel: "선물 추천",
    group: "experience",
  },
  {
    key: "good_for_diary",
    selectionLabel: "다꾸하기 좋아요",
    shortLabel: "다꾸템",
    group: "experience",
  },
] as const;

export const TAG_KEYS = TAG_DEFINITIONS.map((tag) => tag.key);

export type TagGroup = (typeof TAG_GROUPS)[number];
export type TagKey = (typeof TAG_DEFINITIONS)[number]["key"];
