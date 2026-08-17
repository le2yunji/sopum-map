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

export const MAP_TAGS = [
  "문구",
  "캐릭터",
  "빈티지",
  "가챠",
  "인형",
  "키덜트",
] as const;
