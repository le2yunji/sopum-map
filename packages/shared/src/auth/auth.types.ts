import { AUTH_PROVIDERS } from "./auth.constants.js";

import type { ApiResponse } from "../api/api.types.js";

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export type AuthUser = Readonly<{
  id: string;
  nickname: string;
  profileImage: string | null;
}>;

export type GetMeResponse = ApiResponse<AuthUser>;
