import { ShopSchemaType } from "../models/shop.model.js";
import { ShopListItem, TAG_DEFINITION_BY_KEY } from "@sopum-map/shared";

/** 매장 태그 집계를 API 응답 형태로 변환합니다. */
export const mapShopTags = (
  tagStats: ShopSchemaType["tagStats"],
): ShopListItem["tags"] => {
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
