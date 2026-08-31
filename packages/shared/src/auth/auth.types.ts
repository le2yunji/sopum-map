import { AUTH_PROVIDERS } from "./auth.constants.js";

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
