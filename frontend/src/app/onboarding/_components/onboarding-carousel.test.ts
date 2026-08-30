import { describe, expect, it } from "vitest";

import {
  getNextSlide,
  getPreviousSlide,
  getSwipeDirection,
} from "./onboarding-carousel";

describe("onboarding carousel navigation", () => {
  it("첫 페이지보다 이전으로 이동하지 않는다", () => {
    expect(getPreviousSlide(0)).toBe(0);
  });

  it("마지막 페이지보다 다음으로 이동하지 않는다", () => {
    expect(getNextSlide(3, 4)).toBe(3);
  });

  it.each([
    [160, 100, "next"],
    [100, 160, "previous"],
    [100, 125, null],
  ] as const)("%spx에서 %spx로 움직인 스와이프를 판정한다", (start, end, expected) => {
    expect(getSwipeDirection(start, end)).toBe(expected);
  });
});
