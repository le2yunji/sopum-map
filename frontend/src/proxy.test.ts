import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

/** 테스트할 주소와 선택적인 쿠키로 Next.js 요청을 만듭니다. */
function createRequest(path: string, cookie?: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("proxy", () => {
  it.each(["/", "/login", "/login?from=home"])(
    "첫 방문 요청 %s를 온보딩으로 보낸다",
    (path) => {
      const response = proxy(createRequest(path));
      const location = new URL(response.headers.get("location") ?? "");

      expect(response.status).toBe(307);
      expect(location.pathname).toBe("/onboarding");
      expect(location.search).toBe("");
    },
  );

  it("완료 쿠키가 있으면 요청을 그대로 통과시킨다", () => {
    const response = proxy(
      createRequest("/", "sopum_onboarding_completed=1"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("location")).toBeNull();
  });

  it("이름은 같지만 완료 값이 아니면 온보딩으로 보낸다", () => {
    const response = proxy(
      createRequest("/", "sopum_onboarding_completed=0"),
    );

    expect(response.status).toBe(307);
  });
});
