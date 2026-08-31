import type {
  OAuthAuthorizationParams,
  OAuthProvider,
} from "./oauth-provider.js";

type KakaoProviderConfig = Readonly<{
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}>;

type KakaoTokenResponse = Readonly<{
  access_token: string;
  token_type: string;
  expires_in: number;

  refresh_token?: string;
  refresh_token_expires_in?: number;

  id_token?: string;
}>;

export class KakaoProvider implements OAuthProvider {
  readonly name = "kakao";

  constructor(private readonly config: KakaoProviderConfig) {}

  getAuthorizationUrl({ state, nonce }: OAuthAuthorizationParams) {
    const url = new URL("https://kauth.kakao.com/oauth/authorize");

    url.searchParams.set("response_type", "code");

    url.searchParams.set("client_id", this.config.clientId);

    url.searchParams.set("redirect_uri", this.config.redirectUri);

    url.searchParams.set("state", state);

    url.searchParams.set("nonce", nonce);

    return url.toString();
  }
}
