import { afterEach, describe, expect, it, vi } from "vitest";

import { KakaoProvider } from "./kakao.provider.js";

describe("KakaoProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("인가 코드를 카카오 ID Token으로 교환한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,

      json: vi.fn().mockResolvedValue({
        token_type: "bearer",
        access_token: "access-token",
        expires_in: 43199,
        refresh_token: "refresh-token",
        refresh_token_expires_in: 5184000,
        id_token: "kakao-id-token",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const provider = new KakaoProvider({
      clientId: "rest-api-key",
      clientSecret: "client-secret",
      redirectUri: "http://localhost:4000/api/auth/kakao/callback",
    });

    const result = await provider.exchangeCode("authorization-code");

    expect(result).toEqual({
      idToken: "kakao-id-token",
    });
  });
});
