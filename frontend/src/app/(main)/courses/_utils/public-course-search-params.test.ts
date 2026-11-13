import { describe, expect, it } from "vitest";

import { parsePublicCourseSearchParams } from "./public-course-search-params";

describe("parsePublicCourseSearchParams", () => {
  it("검색 조건이 없으면 최신순을 사용한다", () => {
    expect(parsePublicCourseSearchParams({})).toEqual({
      sort: "latest",
    });
  });

  it("지원하지 않는 지역과 정렬은 기본값으로 복구한다", () => {
    expect(
      parsePublicCourseSearchParams({
        regionGroup: "unknown-region",
        sort: "unknown-sort",
      }),
    ).toEqual({
      sort: "latest",
    });
  });

  it("유효한 지역과 인기순 조건을 유지한다", () => {
    expect(
      parsePublicCourseSearchParams({
        regionGroup: "mangwon",
        sort: "popular",
      }),
    ).toEqual({
      regionGroup: "mangwon",
      sort: "popular",
    });
  });

  it("배열 값은 앞에서부터 첫 유효값을 사용한다", () => {
    expect(
      parsePublicCourseSearchParams({
        regionGroup: ["unknown-region", "seochon", "mangwon"],
        sort: ["unknown-sort", "popular", "latest"],
      }),
    ).toEqual({
      regionGroup: "seochon",
      sort: "popular",
    });
  });
});
