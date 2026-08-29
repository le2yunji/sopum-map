import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ONBOARDING_COOKIE_NAME,
  ONBOARDING_COOKIE_VALUE,
} from "./lib/onboarding/onboarding.constants";

/** 첫 방문자를 온보딩으로 보내고 완료한 요청은 그대로 통과시킵니다. */
export function proxy(request: NextRequest): NextResponse {
  const completed =
    request.cookies.get(ONBOARDING_COOKIE_NAME)?.value ===
    ONBOARDING_COOKIE_VALUE;

  if (completed) {
    return NextResponse.next();
  }

  const onboardingUrl = request.nextUrl.clone();

  onboardingUrl.pathname = "/onboarding";
  onboardingUrl.search = "";

  return NextResponse.redirect(onboardingUrl);
}

export const config = {
  matcher: ["/", "/login"],
};
