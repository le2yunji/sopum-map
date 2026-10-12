import { describe, expect, it } from "vitest";

import { getPickShopImageLoading } from "./PickShopGrid";

describe("getPickShopImageLoading", () => {
  it("첫 줄 두 이미지에는 eager를 사용합니다", () => {
    expect(getPickShopImageLoading(0)).toBe("eager");
    expect(getPickShopImageLoading(1)).toBe("eager");
  });

  it("두 번째 줄부터 lazy를 사용합니다", () => {
    expect(getPickShopImageLoading(2)).toBe("lazy");
  });
});
