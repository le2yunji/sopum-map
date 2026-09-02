import type { Types } from "mongoose";

import AuthIdentityModel from "../../models/auth-identity.model.js";
import UserModel from "../../models/user.model.js";

import type { SocialIdentity } from "./auth.types.js";

import type { OAuthProvider } from "../../providers/auth/oauth-provider.js";

import {
  consumeOAuthTransaction,
  createOAuthTransaction,
} from "./oauth-transaction.service.js";

import AuthSessionModel from "../../models/auth-session.model.js";

import { createSecureToken, hashToken } from "../../utils/secure-token.js";

import { AUTH_SESSION_TTL_MS } from "./auth.constants.js";

export async function startOAuthLogin(
  provider: OAuthProvider,
  returnTo?: string,
) {
  const transaction = await createOAuthTransaction(provider.name, returnTo);

  return provider.getAuthorizationUrl({
    state: transaction.state,
    nonce: transaction.nonce,
  });
}

export async function completeOAuthLogin(
  provider: OAuthProvider,
  code: string,
  state: string,
) {
  /**
   * 1. OAuth state 검증
   */
  const transaction = await consumeOAuthTransaction(provider.name, state);

  if (!transaction) {
    throw new Error("유효하지 않은 OAuth 로그인 요청입니다.");
  }

  /**
   * 2. Authorization Code → ID Token
   */
  const { idToken } = await provider.exchangeCode(code);

  /**
   * 3. OIDC ID Token 검증 → sub
   */
  const identity = await provider.verifyIdentity({
    idToken,
    nonceHash: transaction.nonceHash,
  });

  /**
   * 4. Provider별 결과를
   * 우리 서비스 공통 형태로 변환
   */
  const socialIdentity: SocialIdentity = {
    provider: provider.name,

    providerUserId: identity.providerUserId,
  };

  /**
   * 5. 기존 회원 조회 또는 신규 회원 생성
   */
  const user = await findOrCreateAuthUser(socialIdentity);

  /**
   * 6. 우리 서비스 로그인 세션 생성
   */
  const { sessionToken, expiresAt } = await createAuthSession(user._id);

  /**
   * Controller가 Cookie와 redirect를 처리할 수 있도록
   * 필요한 값만 반환
   */
  return {
    user,
    sessionToken,
    sessionExpiresAt: expiresAt,
    returnTo: transaction.returnTo,
  };
}

/**
 * 소셜 로그인으로 검증된 사용자를
 * 우리 서비스의 User와 연결합니다.
 *
 * 기존 회원:
 * AuthIdentity → User 조회
 *
 * 신규 회원:
 * User 생성 → AuthIdentity 생성
 */
export async function findOrCreateAuthUser(socialIdentity: SocialIdentity) {
  /**
   * 같은 소셜 계정으로 가입한 기록이 있는지 확인합니다.
   *
   * 예:
   *
   * provider = "kakao"
   * providerUserId = "123456789"
   */
  const authIdentity = await AuthIdentityModel.findOne({
    provider: socialIdentity.provider,
    providerUserId: socialIdentity.providerUserId,
  });

  /**
   * 이미 AuthIdentity가 존재하면 기존 회원입니다.
   */
  if (authIdentity) {
    const user = await UserModel.findById(authIdentity.userId);

    /**
     * AuthIdentity는 있는데 User가 없다면
     * 정상적인 데이터 상태가 아닙니다.
     */
    if (!user) {
      throw new Error("소셜 계정과 연결된 사용자를 찾을 수 없습니다.");
    }

    /**
     * 탈퇴 처리된 사용자는 로그인시키지 않습니다.
     */
    if (user.isDeleted) {
      throw new Error("탈퇴한 사용자입니다.");
    }

    return user;
  }

  /**
   * AuthIdentity가 없다면 처음 로그인한 사용자입니다.
   *
   * 우리 서비스 User를 먼저 생성합니다.
   *
   * nickname/profileImage 등은 Schema의
   * 기본값을 사용합니다.
   */
  const user = await UserModel.create({});

  /**
   * 새 User와 Kakao 계정을 연결합니다.
   */
  await AuthIdentityModel.create({
    userId: user._id,
    provider: socialIdentity.provider,
    providerUserId: socialIdentity.providerUserId,
  });

  return user;
}

/**
 * 우리 서비스의 로그인 세션을 생성합니다.
 *
 * Browser:
 * - sessionToken 원본
 *
 * MongoDB:
 * - sessionToken의 SHA-256 hash
 * - userId
 * - expiresAt
 */
export async function createAuthSession(userId: Types.ObjectId) {
  /**
   * 암호학적으로 안전한 랜덤 토큰 생성
   *
   * {
   *   token,
   *   tokenHash
   * }
   */
  const { token: sessionToken, tokenHash } = createSecureToken();

  /**
   * 우리 서비스 세션 만료시간
   */
  const expiresAt = new Date(Date.now() + AUTH_SESSION_TTL_MS);

  /**
   * DB에는 원본 sessionToken을 저장하지 않습니다.
   *
   * 만약 DB가 노출되더라도 tokenHash를
   * Cookie 값으로 그대로 사용할 수 없도록 합니다.
   */
  await AuthSessionModel.create({
    userId,
    tokenHash,
    expiresAt,
  });

  /**
   * 원본 Token은 Controller가
   * HttpOnly Cookie로 보내야 하므로 반환합니다.
   */
  return {
    sessionToken,
    expiresAt,
  };
}

/**
 * 브라우저에서 전달된 세션 토큰을 검증하고
 * 현재 로그인한 User를 반환합니다.
 */
export async function getAuthenticatedUser(sessionToken: string) {
  /**
   * 브라우저에는 원본 Token이 있고
   * DB에는 hash만 저장되어 있으므로
   * 먼저 동일하게 SHA-256 처리합니다.
   */
  const tokenHash = hashToken(sessionToken);

  /**
   * 아직 만료되지 않은 세션만 조회합니다.
   *
   * TTL index가 있더라도 MongoDB가 정확히
   * 만료 순간에 데이터를 삭제하는 것은 아니므로
   * expiresAt도 직접 검사합니다.
   */
  const session = await AuthSessionModel.findOne({
    tokenHash,

    expiresAt: {
      $gt: new Date(),
    },
  });

  /**
   * 해당 세션이 없다면
   * 로그인하지 않은 상태입니다.
   */
  if (!session) {
    return null;
  }

  /**
   * AuthSession에 연결된 실제 User 조회
   */
  const user = await UserModel.findById(session.userId);

  /**
   * User가 삭제됐거나 데이터가 비정상이라면
   * 인증된 사용자로 취급하지 않습니다.
   */
  if (!user || user.isDeleted) {
    return null;
  }

  return user;
}

/**
 * 브라우저에서 전달된 세션 토큰에 해당하는
 * 로그인 세션을 삭제합니다.
 */
export async function deleteAuthSession(sessionToken: string) {
  /**
   * DB에는 원본 sessionToken이 아니라
   * SHA-256 hash가 저장되어 있습니다.
   */
  const tokenHash = hashToken(sessionToken);

  /**
   * 현재 로그인 세션 삭제
   */
  await AuthSessionModel.deleteOne({
    tokenHash,
  });
}
