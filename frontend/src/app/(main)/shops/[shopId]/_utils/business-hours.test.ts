import type { ShopBusinessHour } from "@sopum-map/shared";
import { describe, expect, it } from "vitest";

import { formatTodayBusinessHours } from "./business-hours";

const businessHours: ShopBusinessHour[] = [
  { day: "monday", isClosed: true, periods: [] },
  {
    day: "tuesday",
    isClosed: false,
    periods: [{ open: "11:00", close: "20:00" }],
  },
];

describe("formatTodayBusinessHours", () => {
  it("한국 시간 기준 오늘의 실제 영업시간을 표시합니다", () => {
    const mondayInKorea = new Date("2026-10-19T03:00:00.000Z");
    const tuesdayInKorea = new Date("2026-10-20T03:00:00.000Z");

    expect(formatTodayBusinessHours(businessHours, mondayInKorea)).toBe("오늘 휴무");
    expect(formatTodayBusinessHours(businessHours, tuesdayInKorea)).toBe(
      "오늘 11:00 - 20:00",
    );
  });

  it("오늘 요일의 운영 정보가 없으면 안내 문구를 표시합니다", () => {
    const wednesdayInKorea = new Date("2026-10-21T03:00:00.000Z");

    expect(formatTodayBusinessHours(businessHours, wednesdayInKorea)).toBe(
      "영업시간 정보 없음",
    );
  });
});
