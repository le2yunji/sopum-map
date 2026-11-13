import { describe, expect, it } from "vitest";

import {
  mergeTrendingCandidates,
  orderCandidatesForDate,
  selectRegionDiverseCourses,
} from "./course-home-recommendation.js";

describe("mergeTrendingCandidates", () => {
  it("각 상위 10개를 합친 뒤 중복 자리를 남은 목록에서 번갈아 채운다", () => {
    const latest = Array.from({ length: 15 }, (_, index) => `course-${index}`);
    const liked = [
      ...Array.from({ length: 10 }, (_, index) => `course-${index}`),
      ...Array.from({ length: 10 }, (_, index) => `liked-${index}`),
    ];

    const result = mergeTrendingCandidates(latest, liked);

    expect(result).toHaveLength(20);
    expect(new Set(result).size).toBe(20);
    expect(result).toEqual(expect.arrayContaining(["course-14", "liked-4"]));
  });
});

describe("orderCandidatesForDate", () => {
  it("같은 날짜와 후보는 같은 순서를 만들고 날짜가 바뀌면 순서가 달라진다", () => {
    const candidates = Array.from(
      { length: 12 },
      (_, index) => `course-${index}`,
    );
    const first = orderCandidatesForDate(candidates, "2026-11-11");

    expect(orderCandidatesForDate(candidates, "2026-11-11")).toEqual(first);
    expect(orderCandidatesForDate(candidates, "2026-11-12")).not.toEqual(first);
  });
});

describe("selectRegionDiverseCourses", () => {
  const courses = [
    { id: "1", regionGroup: "mangwon" as const },
    { id: "2", regionGroup: "mangwon" as const },
    { id: "3", regionGroup: "seochon" as const },
    { id: "4", regionGroup: "hongdae-yeonnam" as const },
  ];

  it("세 지역이 있으면 서로 다른 지역 세 개를 고른다", () => {
    expect(
      selectRegionDiverseCourses(courses).map((course) => course.id),
    ).toEqual(["1", "3", "4"]);
  });

  it("지역이 부족하면 앞선 순서의 중복 지역으로 세 자리를 채운다", () => {
    expect(
      selectRegionDiverseCourses(courses.slice(0, 3)).map(
        (course) => course.id,
      ),
    ).toEqual(["1", "3", "2"]);
  });
});
