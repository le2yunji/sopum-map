import type { TagGroup, TagKey } from "@sopum-map/shared";

export const MAP_REGIONS = [
  {
    value: "all",
    label: "전체",
    regions: [],
  },
  {
    value: "seongsu-seoulforest",
    label: "성수·서울숲",
    regions: ["성수", "서울숲"],
  },
  {
    value: "hongdae-yeonnam",
    label: "홍대·연남",
    regions: ["홍대", "연남"],
  },
  {
    value: "mangwon",
    label: "망원",
    regions: ["망원"],
  },
  {
    value: "seochon",
    label: "서촌",
    regions: ["서촌"],
  },
] as const;

export type MapRegion = (typeof MAP_REGIONS)[number]["value"];

type MapTagFilter =
  | {
      type: "tag";
      value: TagKey;
      label: string;
    }
  | {
      type: "group";
      value: TagGroup;
      label: string;
    };

export const MAP_TAG_FILTERS = [
  {
    type: "tag",
    value: "gacha",
    label: "가챠",
  },
  {
    type: "tag",
    value: "vintage",
    label: "빈티지",
  },
  {
    type: "group",
    value: "character",
    label: "캐릭터",
  },
  {
    type: "tag",
    value: "good_for_gifts",
    label: "선물",
  },
  {
    type: "tag",
    value: "trend_item",
    label: "유행템",
  },
] as const satisfies readonly MapTagFilter[];
