import { describe, expect, it } from "vitest";

import { updateMyProfileSchema } from "./me.validation.js";

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
