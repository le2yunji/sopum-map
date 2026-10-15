import { describe, expect, it } from "vitest";

import { toKoreaDateKey } from "./korea-date.js";

describe("toKoreaDateKey", () => {
  it.each([
    ["2026-10-14T14:59:59.999Z", "2026-10-14"],
    ["2026-10-14T15:00:00.000Z", "2026-10-15"],
  ])("%s를 한국 날짜 %s로 변환한다", (isoDate, expected) => {
    expect(toKoreaDateKey(new Date(isoDate))).toBe(expected);
  });

  it("유효하지 않은 날짜를 거부한다", () => {
    expect(() => toKoreaDateKey(new Date("invalid"))).toThrow(
      "유효한 방문일이 필요합니다.",
    );
  });
});
