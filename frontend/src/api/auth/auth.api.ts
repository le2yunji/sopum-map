import { apiClient } from "../client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * 카카오 OAuth 로그인을 시작합니다.
 *
 * fetch()가 아니라 브라우저 자체를 백엔드 URL로 이동시킵니다.
 */
export function startKakaoLogin(returnTo = "/") {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL 환경변수가 필요합니다.");
  }
  const url = new URL(`${API_BASE_URL}/auth/kakao/start`);

  url.searchParams.set("returnTo", returnTo);

  window.location.assign(url.toString());
}

/**
 * 현재 로그인 세션을 종료합니다.
 */
export async function logout(): Promise<void> {
  await apiClient<void>("/auth/logout", {
    method: "POST",
  });
}
