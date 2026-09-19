import { ShopTag, TAG_DEFINITION_BY_KEY, TagKey } from "@sopum-map/shared";

type ShopTagStat = Readonly<{
  key: TagKey;
  count: number;
}>;

/** 매장 태그 집계를 API 응답 형태로 변환합니다. */
export const mapShopTags = (tagStats: readonly ShopTagStat[]): ShopTag[] => {
  return tagStats.map(({ key, count }) => {
    const tag = TAG_DEFINITION_BY_KEY[key];

    return {
      key,
      count,
      selectionLabel: tag.selectionLabel,
      shortLabel: tag.shortLabel,
      group: tag.group,
    };
  });
};
