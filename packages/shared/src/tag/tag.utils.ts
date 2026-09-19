// tag.utils.ts

import { TAG_DEFINITIONS } from "./tag.constants";

import type { TagDefinition, TagKey } from "./tag.types";

export function getTagDefinition(key: TagKey): TagDefinition {
  const tag = TAG_DEFINITIONS.find((definition) => definition.key === key);

  if (!tag) {
    throw new Error(`존재하지 않는 태그입니다: ${key}`);
  }

  return tag;
}
