import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createOAuthTransaction: vi.fn(),
}));

vi.mock("../oauth-transaction.service.js", () => ({
  createOAuthTransaction: mocks.createOAuthTransaction,
}));

import type { OAuthProvider } from "../../../providers/auth/oauth-provider.js";

import { startOAuthLogin } from "../auth.service.js";

describe("startOAuthLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("OAuth Transaction을 생성하고 authorization URL을 반환한다", async () => {
    mocks.createOAuthTransaction.mockResolvedValue({
      state: "state-value",
      nonce: "nonce-value",
      returnTo: "/map",
      expiresAt: new Date(),
    });

    const provider: OAuthProvider = {
      name: "kakao",

      getAuthorizationUrl: vi
        .fn()
        .mockReturnValue("https://kauth.kakao.com/oauth/authorize"),
    };

    const result = await startOAuthLogin(provider, "/map");

    expect(mocks.createOAuthTransaction).toHaveBeenCalledWith("kakao", "/map");

    expect(provider.getAuthorizationUrl).toHaveBeenCalledWith({
      state: "state-value",
      nonce: "nonce-value",
    });

    expect(result).toBe("https://kauth.kakao.com/oauth/authorize");
  });
});
