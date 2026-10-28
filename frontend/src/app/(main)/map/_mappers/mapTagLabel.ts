import { TAG_DEFINITION_BY_KEY, type TagKey } from "@sopum-map/shared";

/** 지도 내부의 태그 키를 사용자에게 보여줄 공통 label로 바꿉니다. */
export function getMapTagLabel(tagKey: TagKey): string {
  return TAG_DEFINITION_BY_KEY[tagKey].label;
}
