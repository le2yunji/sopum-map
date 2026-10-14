import { describe, expect, it } from "vitest";

import { canReturnWithBrowserHistory } from "./VisitLogCreateScreen";

describe("canReturnWithBrowserHistory", () => {
  it("같은 상점 상세에서 들어온 경우에만 기존 기록을 재사용한다", () => {
    expect(
      canReturnWithBrowserHistory(
        "https://sopum.example/shops/shop-1?tab=logs",
        "https://sopum.example",
        "shop-1",
      ),
    ).toBe(true);
  });

  it.each([
    "",
    "https://outside.example/shops/shop-1",
    "https://sopum.example/shops/shop-2",
    "https://sopum.example/shops/shop-1/reviews/new",
  ])("직접 접근하거나 다른 화면에서 온 기록 %s는 재사용하지 않는다", (referrer) => {
    expect(
      canReturnWithBrowserHistory(
        referrer,
        "https://sopum.example",
        "shop-1",
      ),
    ).toBe(false);
  });
});
