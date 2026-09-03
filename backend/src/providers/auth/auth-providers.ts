import { env } from "../../config/env.js";

import { KakaoProvider } from "./kakao.provider.js";

export const kakaoProvider = new KakaoProvider({
  clientId: env.kakaoRestApiKey,
  clientSecret: env.kakaoClientSecret,
  redirectUri: env.kakaoRedirectUri,
});
