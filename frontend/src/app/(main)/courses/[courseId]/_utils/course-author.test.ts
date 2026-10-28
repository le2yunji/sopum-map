import { describe, expect, it } from "vitest";

import { getCourseAuthorDisplayName } from "./course-author";

describe("getCourseAuthorDisplayName", () => {
  it("내 코스의 작성자 응답이 없으면 현재 사용자 닉네임을 표시합니다", () => {
    expect(
      getCourseAuthorDisplayName({
        authorDisplayName: undefined,
        courseType: "user_created",
        isOwner: true,
        currentUserNickname: "소품수집가",
      }),
    ).toBe("소품수집가");
  });

  it("추천 코스의 작성자 응답이 없으면 서비스 이름을 표시합니다", () => {
    expect(
      getCourseAuthorDisplayName({
        authorDisplayName: undefined,
        courseType: "recommended",
        isOwner: false,
        currentUserNickname: "소품수집가",
      }),
    ).toBe("소품지도");
  });
});
