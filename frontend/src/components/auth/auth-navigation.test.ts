import { describe, expect, it } from "vitest";

import { createAuthRequiredLoginPath } from "./auth-navigation";

describe("createAuthRequiredLoginPath", () => {
  it("내 픽 경로와 인증 필요 이유를 로그인 주소에 담는다", () => {
    expect(createAuthRequiredLoginPath("/picks")).toBe(
      "/login?returnTo=%2Fpicks&reason=auth-required",
    );
  });

  it("내 코스 경로의 슬래시를 안전하게 인코딩한다", () => {
    expect(createAuthRequiredLoginPath("/me/courses")).toBe(
      "/login?returnTo=%2Fme%2Fcourses&reason=auth-required",
    );
  });
});
