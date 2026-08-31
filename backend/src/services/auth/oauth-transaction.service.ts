/**
 * OAuth 로그인 요청의 임시 상태(state/nonce)를 관리하는 파일
 */

import type { AuthProvider } from "@sopum-map/shared";

import OAuthTransactionModel from "../../models/oauth-transaction.model.js";
import { createSecureToken, hashToken } from "../../utils/secure-token.js";

import { OAUTH_TRANSACTION_TTL_MS } from "./auth.constants.js";

/**
 * 로그인 완료 후 돌아갈 경로를 안전한 내부 경로로 정규화합니다.
 *
 * 허용:
 * /map
 * /map?shopId=123
 *
 * 차단:
 * https://evil.com
 * //evil.com
 */
export function normalizeReturnTo(returnTo?: string) {
  if (!returnTo?.startsWith("/")) {
    return "/";
  }

  try {
    const baseUrl = new URL("https://sopum.local");

    const targetUrl = new URL(returnTo, baseUrl);

    if (targetUrl.origin !== baseUrl.origin) {
      return "/";
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return "/";
  }
}

/**
 * OAuth 로그인을 시작할 때 필요한 일회성 Transaction을 생성합니다.
 *
 * 1. returnTo 검증
 * 2. state 생성
 * 3. nonce 생성
 * 4. DB에는 state/nonce 원본 대신 hash 저장
 * 5. 일정 시간 후 만료되도록 expiresAt 저장
 *
 * 원본 state/nonce는 OAuth Provider에 전달하기 위해 반환합니다.
 */
export async function createOAuthTransaction(
  provider: AuthProvider,
  returnTo?: string,
) {
  const normalizedReturnTo = normalizeReturnTo(returnTo);

  const state = createSecureToken();
  const nonce = createSecureToken();

  const expiresAt = new Date(Date.now() + OAUTH_TRANSACTION_TTL_MS);

  await OAuthTransactionModel.create({
    provider,

    stateHash: state.tokenHash,
    nonceHash: nonce.tokenHash,

    returnTo: normalizedReturnTo,

    expiresAt,
  });

  return {
    state: state.token,
    nonce: nonce.token,

    returnTo: normalizedReturnTo,
    expiresAt,
  };
}

/**
 * OAuth callback으로 전달된 state를 검증하고
 * 해당 Transaction을 일회성으로 소비합니다.
 *
 * - state를 hash한 뒤 DB에서 조회
 * - provider가 일치해야 함
 * - 아직 만료되지 않아야 함
 * - findOneAndDelete를 사용해 재사용을 막음
 */
export async function consumeOAuthTransaction(
  provider: AuthProvider,
  state: string,
) {
  const stateHash = hashToken(state);

  return OAuthTransactionModel.findOneAndDelete({
    provider,

    stateHash,

    expiresAt: {
      $gt: new Date(),
    },
  });
}
