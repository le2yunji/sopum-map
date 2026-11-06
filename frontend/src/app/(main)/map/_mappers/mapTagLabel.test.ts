import { describe, expect, it } from "vitest";

import { getMapTagLabel } from "./mapTagLabel";

describe("getMapTagLabel", () => {
  it("지도 상점 태그 키를 공통 label로 바꾼다", () => {
    expect(getMapTagLabel("diary_supplies")).toBe("다꾸템");
    expect(getMapTagLabel("impulse_buying")).toBe("충동구매 유발");
  });
});
