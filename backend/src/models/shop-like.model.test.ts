import { describe, expect, it } from "vitest";

import ShopLikeModel from "./shop-like.model.js";

describe("ShopLike model", () => {
  it("상점별 좋아요 집계를 위한 shopId 인덱스를 제공한다", () => {
    const indexes = ShopLikeModel.schema.indexes();

    expect(indexes).toContainEqual([{ shopId: 1 }, {}]);
  });
});
