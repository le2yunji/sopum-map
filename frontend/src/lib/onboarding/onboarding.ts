import {
  ONBOARDING_COOKIE_MAX_AGE,
  ONBOARDING_COOKIE_NAME,
  ONBOARDING_COOKIE_VALUE,
  ONBOARDING_TRANSITION_MS,
} from "./onboarding.constants";

/** 외부 이동을 막고 온보딩 이후 사용할 내부 목적지만 반환합니다. */
export function normalizeOnboardingDestination(
  value: string | string[] | undefined,
): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

/** 현재 연결 보안 수준에 맞는 온보딩 완료 쿠키 문자열을 만듭니다. */
export function createOnboardingCookie(isSecure: boolean): string {
  const cookie = [
    `${ONBOARDING_COOKIE_NAME}=${ONBOARDING_COOKIE_VALUE}`,
    "Path=/",
    `Max-Age=${ONBOARDING_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];

  if (isSecure) {
    cookie.push("Secure");
  }

  return cookie.join("; ");
}

/** 온보딩 노출 시간이 지나면 완료 작업을 실행하고 취소 함수를 반환합니다. */
export function startOnboardingTransition(onComplete: () => void): () => void {
  const timeoutId = setTimeout(onComplete, ONBOARDING_TRANSITION_MS);

  return () => clearTimeout(timeoutId);
}
