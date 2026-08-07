import { describe, expect, it } from "vitest";

import { getShopsQuerySchema } from "./shop.validation";

describe("getShopsQuerySchema", () => {
  it("페이지, 개수, 정렬의 기본값을 적용한다", () => {
    const result = getShopsQuerySchema.parse({});

    expect(result).toEqual({
      page: 1,
      limit: 20,
      sort: "latest",
    });
  });

  it("문자열 숫자를 숫자로 변환한다", () => {
    const result = getShopsQuerySchema.parse({
      lat: "37.5665",
      lng: "126.978",
      radius: "1500",
      page: "2",
      limit: "10",
      sort: "distance",
    });

    expect(result).toMatchObject({
      lat: 37.5665,
      lng: 126.978,
      radius: 1500,
      page: 2,
      limit: 10,
      sort: "distance",
    });
  });

  it.each([
    [{ lat: "37.5" }, "location"],
    [{ lng: "127" }, "location"],
    [{ radius: "1000" }, "radius"],
    [{ sort: "distance" }, "sort"],
  ])("좌표 조합이 올바르지 않은 요청 %o을 거부한다", (input, path) => {
    const result = getShopsQuerySchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === path)).toBe(
        true,
      );
    }
  });

  it.each([
    [{ lat: "90.1", lng: "127" }, "lat"],
    [{ lat: "37.5", lng: "180.1" }, "lng"],
    [{ radius: "0", lat: "37.5", lng: "127" }, "radius"],
    [{ page: "0" }, "page"],
    [{ limit: "101" }, "limit"],
  ])("범위를 벗어난 요청 %o을 거부한다", (input, path) => {
    const result = getShopsQuerySchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === path)).toBe(
        true,
      );
    }
  });

  it.each([
    [{ keyword: "가".repeat(101) }, "keyword"],
    [{ region1: "가".repeat(31) }, "region1"],
    [{ region2: "가".repeat(31) }, "region2"],
    [{ region3: "가".repeat(31) }, "region3"],
  ])("너무 긴 검색 조건 %o을 거부한다", (input, path) => {
    const result = getShopsQuerySchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === path)).toBe(
        true,
      );
    }
  });
});
