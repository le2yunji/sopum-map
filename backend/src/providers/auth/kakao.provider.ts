import { createRemoteJWKSet, jwtVerify } from "jose";

import { hashToken } from "../../utils/secure-token.js";

import type {
  OAuthAuthorizationParams,
  OAuthIdentityVerificationParams,
  OAuthProvider,
} from "./oauth-provider.js";

/**
 * Kakao OIDC ID Token의 발급자(issuer)
 */
const KAKAO_ISSUER = "https://kauth.kakao.com";

/**
 * Kakao가 ID Token 서명 검증용 공개키를 제공하는 JWKS 주소
 *
 * createRemoteJWKSet은 ID Token의 kid에 맞는 공개키를
 * Kakao JWKS에서 찾아 jwtVerify에 제공해줍니다.
 */
const KAKAO_JWKS = createRemoteJWKSet(
  new URL("https://kauth.kakao.com/.well-known/jwks.json"),
);

/**
 * KakaoProvider를 생성할 때 필요한 설정값
 */
type KakaoProviderConfig = Readonly<{
  /**
   * Kakao Developers의 REST API Key
   *
   * OAuth에서는 client_id로 사용되고,
   * OIDC에서는 ID Token의 aud 검증에도 사용됩니다.
   */
  clientId: string;

  /**
   * Kakao Client Secret
   *
   * Authorization Code를 Token으로 교환할 때 사용합니다.
   */
  clientSecret: string;

  /**
   * Kakao 로그인 완료 후 돌아올 우리 백엔드 callback URL
   *
   * 예:
   * http://localhost:4000/api/auth/kakao/callback
   */
  redirectUri: string;
}>;

/**
 * Kakao Token Endpoint의 응답 형태
 */
type KakaoTokenResponse = Readonly<{
  access_token: string;
  token_type: string;
  expires_in: number;

  refresh_token?: string;
  refresh_token_expires_in?: number;

  /**
   * OIDC를 사용했을 때 발급되는 ID Token
   */
  id_token?: string;
}>;

/**
 * Kakao OAuth/OIDC 처리 전용 클래스
 *
 * 역할:
 * 1. Kakao 로그인 URL 생성
 * 2. Authorization Code → ID Token 교환
 * 3. ID Token 검증 후 Kakao 사용자 ID(sub) 반환
 */
export class KakaoProvider implements OAuthProvider {
  /**
   * 이 Provider의 종류
   */
  readonly name = "kakao";

  /**
   * KakaoProvider가 동작하는 데 필요한 설정을
   * 외부에서 받아서 객체 내부에 저장합니다.
   */
  constructor(private readonly config: KakaoProviderConfig) {}

  /**
   * Kakao 로그인 화면으로 이동하기 위한 URL 생성
   */
  getAuthorizationUrl({ state, nonce }: OAuthAuthorizationParams) {
    const url = new URL("https://kauth.kakao.com/oauth/authorize");

    /**
     * Authorization Code Flow 사용
     */
    url.searchParams.set("response_type", "code");

    /**
     * 우리 Kakao 앱 식별
     */
    url.searchParams.set("client_id", this.config.clientId);

    /**
     * 로그인 완료 후 돌아올 callback
     */
    url.searchParams.set("redirect_uri", this.config.redirectUri);

    /**
     * OAuth 요청과 callback을 연결하기 위한 값
     */
    url.searchParams.set("state", state);

    /**
     * 이번 로그인 요청과 ID Token을 연결하기 위한 값
     */
    url.searchParams.set("nonce", nonce);

    return url.toString();
  }

  /**
   * Kakao callback으로 받은 Authorization Code를
   * Kakao Token Endpoint에 보내 ID Token으로 교환합니다.
   */
  async exchangeCode(code: string) {
    const body = new URLSearchParams();

    /**
     * Authorization Code를 Token으로 교환한다는 의미
     */
    body.set("grant_type", "authorization_code");

    /**
     * Kakao REST API Key
     */
    body.set("client_id", this.config.clientId);

    /**
     * Kakao Client Secret
     */
    body.set("client_secret", this.config.clientSecret);

    /**
     * Authorization 요청 때 사용했던 것과
     * 동일한 redirect URI
     */
    body.set("redirect_uri", this.config.redirectUri);

    /**
     * callback으로 받은 일회성 Authorization Code
     */
    body.set("code", code);

    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("카카오 토큰 발급에 실패했습니다.");
    }

    const tokenResponse = (await response.json()) as KakaoTokenResponse;

    /**
     * 우리는 OIDC 로그인을 사용하기 때문에
     * ID Token이 반드시 필요합니다.
     */
    if (!tokenResponse.id_token) {
      throw new Error("카카오 ID Token이 발급되지 않았습니다.");
    }

    /**
     * access_token / refresh_token은 현재 사용하지 않고
     * ID Token만 상위 AuthService로 전달합니다.
     */
    return {
      idToken: tokenResponse.id_token,
    };
  }

  /**
   * Kakao가 발급한 ID Token을 검증하고
   * 인증된 Kakao 사용자 ID(sub)를 반환합니다.
   */
  async verifyIdentity({
    idToken,
    nonceHash,
  }: OAuthIdentityVerificationParams) {
    /**
     * jwtVerify가 다음을 검증합니다.
     *
     * - JWT 서명
     * - issuer(iss)
     * - audience(aud)
     * - expiration(exp)
     * - 허용된 서명 알고리즘
     */
    const { payload } = await jwtVerify(idToken, KAKAO_JWKS, {
      /**
       * "이 Token을 정말 Kakao가 발급했는가?"
       */
      issuer: KAKAO_ISSUER,

      /**
       * "이 Token이 우리 Kakao 앱을 위해 발급됐는가?"
       *
       * Kakao ID Token의 aud는 앱 키입니다.
       */
      audience: this.config.clientId,

      /**
       * 예상하지 않은 알고리즘을 허용하지 않음
       */
      algorithms: ["RS256"],
    });

    /**
     * 로그인 시작 때 nonce를 보냈으므로
     * 정상적인 ID Token에는 nonce가 있어야 합니다.
     */
    if (typeof payload.nonce !== "string") {
      throw new Error("카카오 ID Token에 nonce가 없습니다.");
    }

    /**
     * DB에는 nonce 원본이 아니라 hash만 저장되어 있습니다.
     *
     * ID Token의 nonce
     *       ↓
     * SHA-256
     *       ↓
     * OAuthTransaction.nonceHash와 비교
     */
    const receivedNonceHash = hashToken(payload.nonce);

    if (receivedNonceHash !== nonceHash) {
      throw new Error("카카오 ID Token의 nonce가 일치하지 않습니다.");
    }

    /**
     * sub(subject)
     *
     * Kakao가 인증한 사용자를 식별하는 고유값입니다.
     *
     * 이후:
     *
     * AuthIdentity.providerUserId = payload.sub
     *
     * 로 사용합니다.
     */
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      throw new Error("카카오 ID Token에 sub가 없습니다.");
    }

    return {
      providerUserId: payload.sub,
    };
  }
}
