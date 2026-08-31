import { describe, expect, it } from "vitest";
import { KakaoProvider } from "../kakao.provider";

describe("KakaoProvider", () => {
  it("카카오 OAuth 인가 URL을 생성한다", () => {
    const provider = new KakaoProvider({
      clientId: "kakao-rest-api-key",
      redirectUri: "http://localhost:4000/api/auth/kakao/callback",
    });

    const result = provider.getAuthorizationUrl({
      state: "state-value",
      nonce: "nonce-value",
    });

    const url = new URL(result);

    expect(`${url.origin}${url.pathname}`).toBe(
      "https://kauth.kakao.com/oauth/authorize",
    );

    expect(url.searchParams.get("response_type")).toBe("code");

    expect(url.searchParams.get("client_id")).toBe("kakao-rest-api-key");

    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:4000/api/auth/kakao/callback",
    );

    expect(url.searchParams.get("state")).toBe("state-value");

    expect(url.searchParams.get("nonce")).toBe("nonce-value");
  });

  it("개인정보 scope를 요청하지 않는다", () => {
    const provider = new KakaoProvider({
      clientId: "kakao-rest-api-key",
      redirectUri: "http://localhost:4000/api/auth/kakao/callback",
    });

    const result = provider.getAuthorizationUrl({
      state: "state-value",
      nonce: "nonce-value",
    });

    const url = new URL(result);

    expect(url.searchParams.has("scope")).toBe(false);
  });
});
