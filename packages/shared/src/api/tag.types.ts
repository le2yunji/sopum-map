import type { TagGroup } from "../constants/tag.constants";

export type TagSummaryResponse = {
  id: string;
  name: string;
  type: TagGroup;
};
