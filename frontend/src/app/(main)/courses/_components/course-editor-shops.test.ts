import { describe, expect, it } from "vitest";

import {
  createInitialCourseShopInputs,
  orderCourseShopOptions,
} from "./course-editor-shops";

const shops = Array.from({ length: 8 }, (_, index) => ({
  id: `shop-${index + 1}`,
  name: `${index + 1}번째 상점`,
  address: "서울",
  mainImageUrl: null,
}));

describe("createInitialCourseShopInputs", () => {
  it("새 코스에서 첫 6개 상점을 방문 순서대로 선택합니다", () => {
    expect(createInitialCourseShopInputs(shops)).toEqual(
      shops.slice(0, 6).map((shop, index) => ({
        shopId: shop.id,
        order: index + 1,
        memo: null,
      })),
    );
  });
});

describe("orderCourseShopOptions", () => {
  it("선택한 상점을 방문 순서대로 위에 두고 미선택 상점은 뒤에 둡니다", () => {
    const ordered = orderCourseShopOptions(shops.slice(0, 4), [
      { shopId: "shop-3", order: 1, memo: null },
      { shopId: "shop-1", order: 2, memo: null },
    ]);

    expect(ordered.map((shop) => shop.id)).toEqual([
      "shop-3",
      "shop-1",
      "shop-2",
      "shop-4",
    ]);
  });
});
