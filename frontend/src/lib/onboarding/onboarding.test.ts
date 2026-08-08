import { describe, expect, it } from "vitest";

import {
  createOnboardingCookie,
  normalizeOnboardingDestination,
} from "./onboarding";

describe("normalizeOnboardingDestination", () => {
  it.each(["/", "/login", "/shops/123?tab=info"])(
    "내부 경로 %s를 유지한다",
    (destination) => {
      expect(normalizeOnboardingDestination(destination)).toBe(destination);
    },
  );

  it.each([
    undefined,
    ["/", "/login"],
    "https://evil.example",
    "//evil.example",
    "login",
  ])("안전하지 않은 목적지 %o를 홈으로 바꾼다", (destination) => {
    expect(normalizeOnboardingDestination(destination)).toBe("/");
  });
});

describe("createOnboardingCookie", () => {
  it("HTTP 환경용 1년 완료 쿠키를 만든다", () => {
    expect(createOnboardingCookie(false)).toBe(
      "sopum_onboarding_completed=1; Path=/; Max-Age=31536000; SameSite=Lax",
    );
  });

  it("HTTPS 환경에서는 Secure 속성을 추가한다", () => {
    expect(createOnboardingCookie(true)).toBe(
      "sopum_onboarding_completed=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
    );
  });
});
