import {
  SHOP_CATEGORIES,
  SHOP_REGION_GROUPS,
  TAG_KEYS,
} from "@sopum-map/shared";
import { z } from "zod";
import { createPaginationQuerySchema } from "./pagination.validation.js";
import { objectIdSchema } from "./common.validation.js";

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

const optionalLatitude = optionalNumber.refine(
  (value) => value === undefined || (value >= -90 && value <= 90),
  {
    message: "위도는 -90 이상 90 이하이어야 합니다.",
  },
);

const optionalLongitude = optionalNumber.refine(
  (value) => value === undefined || (value >= -180 && value <= 180),
  {
    message: "경도는 -180 이상 180 이하이어야 합니다.",
  },
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

const shopPaginationQuerySchema = createPaginationQuerySchema({
  defaultLimit: 20,
  maxLimit: 100,
});

export const getShopsQuerySchema = z
  .object({
    category: z.enum(SHOP_CATEGORIES).optional(),

    tagKeys: tagKeysSchema,

    keyword: z.string().trim().min(1).max(100).optional(),

    regionGroup: z.enum(SHOP_REGION_GROUPS).optional(),

    southWestLat: optionalLatitude,

    southWestLng: optionalLongitude,

    northEastLat: optionalLatitude,

    northEastLng: optionalLongitude,

    lat: optionalLatitude,

    lng: optionalLongitude,

    radius: optionalNumber.refine((value) => value === undefined || value > 0, {
      message: "radius는 0보다 커야 합니다.",
    }),

    /**
     * 공통 pagination
     */
    ...shopPaginationQuerySchema.shape,

    sort: z.enum(["latest", "distance", "popular"]).default("latest"),
  })
  .superRefine((value, context) => {
    const hasLat = value.lat !== undefined;
    const hasLng = value.lng !== undefined;
    const mapBoundsValues = [
      value.southWestLat,
      value.southWestLng,
      value.northEastLat,
      value.northEastLng,
    ];
    const hasAnyMapBounds = mapBoundsValues.some(
      (coordinate) => coordinate !== undefined,
    );
    const hasAllMapBounds = mapBoundsValues.every(
      (coordinate) => coordinate !== undefined,
    );

    if (hasAnyMapBounds && !hasAllMapBounds) {
      context.addIssue({
        code: "custom",
        path: ["bounds"],
        message: "지도 경계 좌표는 모두 함께 전달해야 합니다.",
      });
    }

    if (
      value.southWestLat !== undefined &&
      value.northEastLat !== undefined &&
      value.southWestLat >= value.northEastLat
    ) {
      context.addIssue({
        code: "custom",
        path: ["bounds"],
        message: "남서쪽 위도는 북동쪽 위도보다 작아야 합니다.",
      });
    }

    if (
      value.southWestLng !== undefined &&
      value.northEastLng !== undefined &&
      value.southWestLng >= value.northEastLng
    ) {
      context.addIssue({
        code: "custom",
        path: ["bounds"],
        message: "남서쪽 경도는 북동쪽 경도보다 작아야 합니다.",
      });
    }

    if (hasAnyMapBounds && (hasLat || hasLng || value.radius !== undefined)) {
      context.addIssue({
        code: "custom",
        path: ["location"],
        message: "지도 경계와 중심점 조회는 함께 사용할 수 없습니다.",
      });
    }

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
  })
  .transform(
    ({ southWestLat, southWestLng, northEastLat, northEastLng, ...query }) => {
      if (
        southWestLat === undefined ||
        southWestLng === undefined ||
        northEastLat === undefined ||
        northEastLng === undefined
      ) {
        return query;
      }

      return {
        ...query,
        bounds: {
          southWestLat,
          southWestLng,
          northEastLat,
          northEastLng,
        },
      };
    },
  );

const requiredLatitude = optionalLatitude.pipe(z.number());
const requiredLongitude = optionalLongitude.pipe(z.number());

/**
 * 지도 마커 조회에 필요한 경계와 필터를 검증합니다.
 */
export const getShopMapQuerySchema = z
  .object({
    southWestLat: requiredLatitude,
    southWestLng: requiredLongitude,
    northEastLat: requiredLatitude,
    northEastLng: requiredLongitude,
    keyword: z.string().trim().min(1).max(100).optional(),
    tagKeys: tagKeysSchema,
  })
  .superRefine((value, context) => {
    if (value.southWestLat >= value.northEastLat) {
      context.addIssue({
        code: "custom",
        path: ["bounds"],
        message: "남서쪽 위도는 북동쪽 위도보다 작아야 합니다.",
      });
    }

    if (value.southWestLng >= value.northEastLng) {
      context.addIssue({
        code: "custom",
        path: ["bounds"],
        message: "남서쪽 경도는 북동쪽 경도보다 작아야 합니다.",
      });
    }
  })
  .transform(
    ({
      southWestLat,
      southWestLng,
      northEastLat,
      northEastLng,
      ...filters
    }) => {
      return {
        bounds: {
          southWestLat,
          southWestLng,
          northEastLat,
          northEastLng,
        },
        ...filters,
      };
    },
  );

/**
 * Shop ID를 Path Parameter로 받는 API에서 공통 사용
 *
 * GET    /api/shops/:shopId
 * POST   /api/shops/:shopId/likes
 * DELETE /api/shops/:shopId/likes
 */
export const shopIdParamsSchema = z.object({
  shopId: objectIdSchema,
});

export const getShopDetailParamsSchema = shopIdParamsSchema;

export type ParsedGetShopsQuery = z.infer<typeof getShopsQuerySchema>;
