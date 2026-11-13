export type ProtectedRoute = "/picks" | "/me/courses";

/** 보호 페이지에서 사용할 로그인 이동 주소를 만듭니다. */
export function createAuthRequiredLoginPath(returnTo: ProtectedRoute) {
  const searchParams = new URLSearchParams({
    returnTo,
    reason: "auth-required",
  });

  return `/login?${searchParams.toString()}`;
}
