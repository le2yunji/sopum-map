export const meQueryKeys = {
  all: ["me"] as const,
  profile: () => [...meQueryKeys.all, "profile"] as const,
  activitySummary: () => [...meQueryKeys.all, "activity-summary"] as const,
  visitedShops: () => [...meQueryKeys.all, "visited-shops"] as const,
};
