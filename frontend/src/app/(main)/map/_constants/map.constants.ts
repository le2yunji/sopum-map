import {
  ACTIVE_TAG_DEFINITIONS,
  TAG_DEFINITION_BY_KEY,
  TAG_GROUPS,
  type TagGroup,
  type TagKey,
} from "@sopum-map/shared";

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

export type MapTagFilter = Readonly<{
  type: "tag";
  value: TagKey;
  label: string;
}>;

type MapTagFilterGroup = Readonly<{
  value: TagGroup;
  label: string;
  filters: readonly MapTagFilter[];
}>;

const MAP_TAG_GROUP_LABELS = {
  mood: "분위기",
  product: "상품",
  character: "캐릭터",
  price: "가격",
  shopping: "쇼핑 목적",
  experience: "방문 경험",
  feature: "매장 특징",
  trend: "트렌드",
  etc: "기타",
} as const satisfies Record<TagGroup, string>;

export const MAP_TAG_FILTER_GROUPS: readonly MapTagFilterGroup[] =
  TAG_GROUPS.flatMap((group) => {
    const filters = ACTIVE_TAG_DEFINITIONS.filter(
      (tag) => tag.group === group,
    ).map((tag) => ({
      type: "tag" as const,
      value: tag.key,
      label: tag.shortLabel,
    }));

    return filters.length > 0
      ? [{ value: group, label: MAP_TAG_GROUP_LABELS[group], filters }]
      : [];
  });

export type MapTagFilterValue = `filter:tag:${TagKey}`;

/** 칩에서 사용할 문자열 값을 태그 종류와 값이 겹치지 않게 만듭니다. */
export function getMapTagFilterValue(
  filter: MapTagFilter,
): MapTagFilterValue {
  return `filter:tag:${filter.value}`;
}

/** 지도 조회 API에 전달할 실제 태그 키만 추출합니다. */
export function getMapSelectedTagKeys(
  filters: readonly MapTagFilter[],
): TagKey[] {
  return filters.map((filter) => filter.value);
}

/** 지도 상점 목록에서 태그 키를 짧은 공용 표시명으로 바꿉니다. */
export function getMapTagShortLabel(tagKey: TagKey): string {
  return TAG_DEFINITION_BY_KEY[tagKey].shortLabel;
}
