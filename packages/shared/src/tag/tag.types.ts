import type { TAG_DEFINITIONS, TAG_GROUPS } from "./tag.constants";

export type TagGroup = (typeof TAG_GROUPS)[number];
export type TagKey = (typeof TAG_DEFINITIONS)[number]["key"];
