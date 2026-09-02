import type { AuthProvider } from "@sopum-map/shared";

export type OAuthAuthorizationParams = Readonly<{
  state: string;
  nonce: string;
}>;

/**
 * 인가 코드를 토큰으로 교환하는 규약
 */
export type OAuthTokenResult = Readonly<{
  idToken: string;
}>;

/**
 * ID Token을 검증할 때 필요한 값
 */
export type OAuthIdentityVerificationParams = Readonly<{
  /**
   * Provider가 발급한 OIDC ID Token
   */
  idToken: string;

  /**
   * 로그인 시작 시 생성한 nonce의 hash
   *
   * OAuthTransaction에서 가져옵니다.
   */
  nonceHash: string;
}>;

/**
 * Provider가 검증을 끝낸 뒤 반환하는 사용자 식별 결과
 */
export type OAuthIdentityResult = Readonly<{
  providerUserId: string;
}>;

/**
 * 외부 OAuth 구현체 규약
 */
export interface OAuthProvider {
  readonly name: AuthProvider;

  getAuthorizationUrl(params: OAuthAuthorizationParams): string;

  exchangeCode(code: string): Promise<OAuthTokenResult>;

  verifyIdentity(
    params: OAuthIdentityVerificationParams,
  ): Promise<OAuthIdentityResult>;
}
