import type { AuthProvider } from "@sopum-map/shared";

export type OAuthAuthorizationParams = Readonly<{
  state: string;
  nonce: string;
}>;

// 외부 OAuth 구현체 규약
export interface OAuthProvider {
  readonly name: AuthProvider;

  getAuthorizationUrl(params: OAuthAuthorizationParams): string;
}
