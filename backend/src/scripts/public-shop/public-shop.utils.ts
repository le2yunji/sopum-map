import {
  PUBLIC_SHOP_REGIONS,
  type PublicShopRegionGroup,
} from "./public-shop.config";

export function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

export function parseOptionalNumber(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

export function isValidKoreaCoordinate(
  longitude?: number,
  latitude?: number,
): boolean {
  if (longitude === undefined || latitude === undefined) {
    return false;
  }

  return (
    longitude >= 124 && longitude <= 132 && latitude >= 33 && latitude <= 39
  );
}

export function normalizeShopName(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function findRegionGroup(
  region3?: string,
): PublicShopRegionGroup | undefined {
  if (!region3) {
    return undefined;
  }

  for (const [group, regions] of Object.entries(PUBLIC_SHOP_REGIONS)) {
    if ((regions as readonly string[]).includes(region3)) {
      return group as PublicShopRegionGroup;
    }
  }

  return undefined;
}

function levenshteinDistance(left: string, right: string): number {
  const matrix = Array.from(
    {
      length: left.length + 1,
    },
    () => Array<number>(right.length + 1).fill(0),
  );

  for (let i = 0; i <= left.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= right.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,

        matrix[i][j - 1] + 1,

        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

export function calculateNameSimilarity(left: string, right: string): number {
  const a = normalizeShopName(left);

  const b = normalizeShopName(right);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  const distance = levenshteinDistance(a, b);

  return Math.max(0, 1 - distance / Math.max(a.length, b.length));
}

export function calculateDistanceMeters(
  longitude1: number,
  latitude1: number,
  longitude2: number,
  latitude2: number,
): number {
  const EARTH_RADIUS = 6_371_000;

  const toRadians = (degree: number) => (degree * Math.PI) / 180;

  const latitudeDelta = toRadians(latitude2 - latitude1);

  const longitudeDelta = toRadians(longitude2 - longitude1);

  const latitude1Radians = toRadians(latitude1);

  const latitude2Radians = toRadians(latitude2);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1Radians) *
      Math.cos(latitude2Radians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
