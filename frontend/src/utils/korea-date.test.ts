import { describe, expect, it } from "vitest";

import { toKoreaDateKey } from "./korea-date";

describe("toKoreaDateKey", () => {
  it.each([
    ["2026-11-11T14:59:59.999Z", "2026-11-11"],
    ["2026-11-11T15:00:00.000Z", "2026-11-12"],
  ])("%s를 한국 날짜 %s로 변환한다", (isoDate, expected) => {
    expect(toKoreaDateKey(new Date(isoDate))).toBe(expected);
  });

  it("유효하지 않은 날짜를 거부한다", () => {
    expect(() => toKoreaDateKey(new Date("invalid"))).toThrow(
      "유효한 날짜가 필요합니다.",
    );
  });
});
