import { describe, expect, it } from "vitest";

import { getTodayDateInputValue, toVisitLogIsoDate } from "./visit-log-date";

describe("toVisitLogIsoDate", () => {
  it("입력한 한국 날짜를 한국 정오 ISO 시각으로 변환한다", () => {
    const result = toVisitLogIsoDate("2026-10-13", "2026-10-14");

    expect(result).toBe("2026-10-13T03:00:00.000Z");
    expect(
      new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
        new Date(result),
      ),
    ).toBe("2026-10-13");
  });

  it.each(["", "2026-02-30", "2026-10-15"])(
    "비어 있거나 올바르지 않은 미래 날짜 %s를 거부한다",
    (dateValue) => {
      expect(() => toVisitLogIsoDate(dateValue, "2026-10-14")).toThrow();
    },
  );
});

describe("getTodayDateInputValue", () => {
  it("한국 시간 기준 오늘 날짜를 입력값 형식으로 반환한다", () => {
    expect(getTodayDateInputValue(new Date("2026-10-13T15:30:00.000Z"))).toBe(
      "2026-10-14",
    );
  });
});
