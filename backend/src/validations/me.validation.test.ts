import { describe, expect, it } from "vitest";

import {
  getMyVisitedShopsQuerySchema,
  updateMyProfileSchema,
} from "./me.validation.js";

describe("updateMyProfileSchema", () => {
  it("닉네임의 앞뒤 공백을 제거합니다", () => {
    const result = updateMyProfileSchema.parse({
      body: { nickname: "  소품 수집가  " },
    });

    expect(result.body.nickname).toBe("소품 수집가");
  });

  it.each(["가", "가".repeat(13)])(
    "닉네임이 2자 미만이거나 12자를 넘으면 거부합니다",
    (nickname) => {
      expect(() =>
        updateMyProfileSchema.parse({ body: { nickname } }),
      ).toThrow();
    },
  );

  it("수정할 값이 없는 요청을 거부합니다", () => {
    expect(() => updateMyProfileSchema.parse({ body: {} })).toThrow();
  });
});

describe("getMyVisitedShopsQuerySchema", () => {
  it("페이지와 개수의 기본값을 적용합니다", () => {
    expect(getMyVisitedShopsQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 10,
    });
  });

  it("문자열 페이지 값을 숫자로 변환합니다", () => {
    expect(
      getMyVisitedShopsQuerySchema.parse({ page: "2", limit: "20" }),
    ).toEqual({
      page: 2,
      limit: 20,
    });
  });

  it.each([{ page: "0" }, { limit: "0" }, { limit: "51" }])(
    "범위를 벗어난 페이지 요청 $input을 거부합니다",
    (input) => {
      expect(() => getMyVisitedShopsQuerySchema.parse(input)).toThrow();
    },
  );
});
