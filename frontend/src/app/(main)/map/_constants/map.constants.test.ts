import { describe, expect, it } from "vitest";

import {
  ACTIVE_TAG_DEFINITIONS,
  TAG_GROUPS,
} from "@sopum-map/shared";

import {
  getMapSelectedTagKeys,
  getMapTagShortLabel,
  MAP_TAG_FILTER_GROUPS,
} from "./map.constants";

describe("MAP_TAG_FILTER_GROUPS", () => {
  it("공용 활성 태그를 TAG_GROUPS 순서와 shortLabel로 구성합니다", () => {
    const groupsWithActiveTags = TAG_GROUPS.filter((group) =>
      ACTIVE_TAG_DEFINITIONS.some((tag) => tag.group === group),
    );

    expect(MAP_TAG_FILTER_GROUPS.map((group) => group.value)).toEqual(
      groupsWithActiveTags,
    );
    expect(
      MAP_TAG_FILTER_GROUPS.flatMap((group) => group.filters).map(
        (filter) => ({ value: filter.value, label: filter.label }),
      ),
    ).toEqual(
      ACTIVE_TAG_DEFINITIONS.map((tag) => ({
        value: tag.key,
        label: tag.shortLabel,
      })),
    );
  });
});

describe("map tag helpers", () => {
  it("상점 태그 키를 공용 shortLabel로 변환합니다", () => {
    expect(getMapTagShortLabel("stationery")).toBe("문구 다양");
  });

  it("선택한 지도 필터에서 실제 TagKey만 반환합니다", () => {
    expect(
      getMapSelectedTagKeys([
        { type: "tag", value: "cute", label: "아기자기" },
        { type: "tag", value: "stickers", label: "스티커" },
      ]),
    ).toEqual(["cute", "stickers"]);
  });
});
