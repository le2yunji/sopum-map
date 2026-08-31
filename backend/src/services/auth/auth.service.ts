import type { OAuthProvider } from "../../providers/auth/oauth-provider.js";

import { createOAuthTransaction } from "./oauth-transaction.service.js";

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
