import type { AuthUser, GetMeResponse } from "@sopum-map/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL 환경변수가 필요합니다.");
}

/**
 * 카카오 OAuth 로그인을 시작합니다.
 *
 * fetch()가 아니라 브라우저 자체를 백엔드 URL로 이동시킵니다.
 *
 * Backend
 * → Kakao
 * → Backend callback
 * → Frontend
 *
 * 으로 브라우저가 계속 이동해야 하기 때문입니다.
 */
export function startKakaoLogin(returnTo = "/") {
  const url = new URL(`${API_BASE_URL}/auth/kakao/start`);

  url.searchParams.set("returnTo", returnTo);

  window.location.assign(url.toString());
}

/**
 * 현재 로그인한 사용자를 조회합니다.
 *
 * HttpOnly Cookie는 JavaScript에서 직접 읽을 수 없으므로
 * 브라우저가 Cookie를 요청에 자동으로 포함하도록
 * credentials: "include"를 사용합니다.
 */
export async function getMe(): Promise<AuthUser | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  /**
   * 로그인하지 않은 상태는
   * 예외 상황이 아니라 정상적인 상태로 봅니다.
   */
  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("사용자 정보를 불러오지 못했습니다.");
  }

  const result = (await response.json()) as GetMeResponse;

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * 현재 로그인 세션을 종료합니다.
 */
export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("로그아웃에 실패했습니다.");
  }
}
