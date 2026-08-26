import { SHOP_CATEGORIES, TAG_KEYS } from "@sopum-map/shared";
import { z } from "zod";

/**
 * 빈 문자열을 undefined로 변환한다.
 *
 * 예: ?radius= → undefined
 */
const emptyStringToUndefined = (value: unknown): unknown => {
  return value === "" ? undefined : value;
};

const optionalNumber = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().finite().optional(),
);

const tagKeysSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === "") {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }

    return [value];
  },

  z.array(z.enum(TAG_KEYS)).optional(),
);

export const getShopsQuerySchema = z
  .object({
    category: z.enum(SHOP_CATEGORIES).optional(),

    tagKeys: tagKeysSchema,

    keyword: z.string().trim().min(1).max(100).optional(),

    region1: z.string().trim().min(1).max(30).optional(),

    region2: z.string().trim().min(1).max(30).optional(),

    region3: z.string().trim().min(1).max(30).optional(),

    lat: optionalNumber.refine(
      (value) => value === undefined || (value >= -90 && value <= 90),
      {
        message: "lat는 -90 이상 90 이하이어야 합니다.",
      },
    ),

    lng: optionalNumber.refine(
      (value) => value === undefined || (value >= -180 && value <= 180),
      {
        message: "lng는 -180 이상 180 이하이어야 합니다.",
      },
    ),

    radius: optionalNumber.refine((value) => value === undefined || value > 0, {
      message: "radius는 0보다 커야 합니다.",
    }),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    sort: z.enum(["latest", "distance", "popular"]).default("latest"),
  })
  .superRefine((value, context) => {
    const hasLat = value.lat !== undefined;
    const hasLng = value.lng !== undefined;

    if (hasLat !== hasLng) {
      context.addIssue({
        code: "custom",
        path: ["location"],
        message: "lat와 lng는 함께 전달해야 합니다.",
      });
    }

    if (value.radius !== undefined && (!hasLat || !hasLng)) {
      context.addIssue({
        code: "custom",
        path: ["radius"],
        message: "radius를 사용하려면 lat와 lng가 필요합니다.",
      });
    }

    if (value.sort === "distance" && (!hasLat || !hasLng)) {
      context.addIssue({
        code: "custom",
        path: ["sort"],
        message: "거리순 정렬을 사용하려면 lat와 lng가 필요합니다.",
      });
    }
  });

/**
 * MongoDB ObjectId는
 * 24자리 16진수 문자열이다.
 */
const mongoObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "유효하지 않은 shopId입니다.",
});

/**
 * GET /api/shops/:shopId
 *
 * Path Parameter 검증
 */
export const getShopDetailParamsSchema = z.object({
  shopId: mongoObjectIdSchema,
});

export type ParsedGetShopsQuery = z.infer<typeof getShopsQuerySchema>;
