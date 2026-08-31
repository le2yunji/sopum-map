import type { AuthProvider } from "@sopum-map/shared";

export type SocialIdentity = {
  provider: AuthProvider;
  providerUserId: string;
};
