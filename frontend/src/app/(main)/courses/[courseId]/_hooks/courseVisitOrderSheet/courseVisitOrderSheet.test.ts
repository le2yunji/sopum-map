import { describe, expect, it } from "vitest";

import { getNextCourseVisitOrderSheetState } from "./courseVisitOrderSheet";

describe("getNextCourseVisitOrderSheetState", () => {
  it("40px 이상 위로 끌면 시트를 펼칩니다", () => {
    expect(
      getNextCourseVisitOrderSheetState({
        deltaY: -40,
        currentTranslateY: 400,
        collapsedTranslateY: 500,
      }),
    ).toBe("expanded");
  });

  it("40px 이상 아래로 끌면 시트를 접습니다", () => {
    expect(
      getNextCourseVisitOrderSheetState({
        deltaY: 40,
        currentTranslateY: 100,
        collapsedTranslateY: 500,
      }),
    ).toBe("collapsed");
  });

  it("짧게 움직이면 중간 위치를 기준으로 가까운 상태에 붙습니다", () => {
    expect(
      getNextCourseVisitOrderSheetState({
        deltaY: 10,
        currentTranslateY: 200,
        collapsedTranslateY: 500,
      }),
    ).toBe("expanded");

    expect(
      getNextCourseVisitOrderSheetState({
        deltaY: -10,
        currentTranslateY: 300,
        collapsedTranslateY: 500,
      }),
    ).toBe("collapsed");
  });
});
