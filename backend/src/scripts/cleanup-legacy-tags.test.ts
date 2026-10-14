import { describe, expect, it } from "vitest";

import { TAG_KEYS } from "@sopum-map/shared";

describe("허용 방문 로그 태그", () => {
  it("고정된 24개 태그만 제공한다", () => {
    expect(TAG_KEYS).toEqual([
      "keyrings",
      "stickers",
      "diary_supplies",
      "plush",
      "figures",
      "gacha",
      "sanrio",
      "shinchan",
      "indie_artist",
      "trend_item",
      "stationery",
      "interior",
      "cute",
      "vintage",
      "kitsch",
      "hip",
      "lovely",
      "cozy",
      "good_for_gifts",
      "friendly",
      "spacious",
      "good_value",
      "lots_to_see",
      "impulse_buying",
    ]);
  });
});
