import { describe, expect, it } from "vitest";

import { analyzeVisitLogDates } from "./backfill-visit-log-dates.js";

describe("analyzeVisitLogDates", () => {
  it("누락된 한국 날짜 백필과 활성 중복 ID를 함께 찾는다", () => {
    const result = analyzeVisitLogDates([
      { _id: "log-1", userId: "user-1", shopId: "shop-1", visitedAt: new Date("2026-10-14T15:00:00.000Z"), status: "active" },
      { _id: "log-2", userId: "user-1", shopId: "shop-1", visitedAt: new Date("2026-10-15T01:00:00.000Z"), status: "active" },
      { _id: "log-3", userId: "user-1", shopId: "shop-1", visitedAt: new Date("2026-10-15T01:00:00.000Z"), visitedDate: "2026-10-15", status: "deleted" },
    ]);

    expect(result.updates).toEqual([
      { id: "log-1", visitedDate: "2026-10-15" },
      { id: "log-2", visitedDate: "2026-10-15" },
    ]);
    expect(result.duplicates).toEqual([
      {
        userId: "user-1",
        shopId: "shop-1",
        visitedDate: "2026-10-15",
        visitLogIds: ["log-1", "log-2"],
      },
    ]);
  });

  it("중복이 없으면 백필 대상만 반환한다", () => {
    const result = analyzeVisitLogDates([
      { _id: "log-1", userId: "user-1", shopId: "shop-1", visitedAt: new Date("2026-10-14T03:00:00.000Z"), status: "active" },
    ]);

    expect(result.updates).toEqual([{ id: "log-1", visitedDate: "2026-10-14" }]);
    expect(result.duplicates).toEqual([]);
  });
});
