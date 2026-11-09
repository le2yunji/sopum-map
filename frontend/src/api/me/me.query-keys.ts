export const ME_QUERY_KEYS = {
  all: ["me"] as const,
  profile: () => [...ME_QUERY_KEYS.all, "profile"] as const,
};
