import { describe, expect, it } from "vitest";

import { getNextSheetState } from "./mapShopListSheet.utils";

describe("getNextSheetState", () => {
  it("충분히 위로 끌면 시트를 펼칩니다", () => {
    expect(
      getNextSheetState({
        deltaY: -40,
        currentTranslateY: 300,
        collapsedTranslateY: 500,
      }),
    ).toBe("expanded");
  });

  it("짧게 움직이면 중간 위치를 기준으로 상태를 결정합니다", () => {
    expect(
      getNextSheetState({
        deltaY: 10,
        currentTranslateY: 200,
        collapsedTranslateY: 500,
      }),
    ).toBe("expanded");
    expect(
      getNextSheetState({
        deltaY: -10,
        currentTranslateY: 300,
        collapsedTranslateY: 500,
      }),
    ).toBe("collapsed");
  });
});
