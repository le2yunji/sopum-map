import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOnboardingCookie,
  startOnboardingTransition,
} from "./onboarding";

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

describe("startOnboardingTransition", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("1.5초 뒤 완료 작업을 한 번 실행한다", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    startOnboardingTransition(onComplete);
    vi.advanceTimersByTime(1_499);

    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("정리 함수를 호출하면 완료 작업을 취소한다", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const cancel = startOnboardingTransition(onComplete);

    cancel();
    vi.advanceTimersByTime(1_500);

    expect(onComplete).not.toHaveBeenCalled();
  });
});
