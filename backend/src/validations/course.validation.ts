import { z } from "zod";

import { objectIdSchema } from "./common.validation.js";
import { SHOP_REGION_GROUPS } from "@sopum-map/shared";

const courseShopSchema = z.object({
  shopId: objectIdSchema,
  order: z.number().int().min(1),
  memo: z.string().trim().max(300).nullable().optional(),
});

/**
 * 사용자 코스 생성 요청
 */
export const createCourseSchema = z.object({
  body: z.object({
    sourceFolderId: objectIdSchema,
    regionGroup: z.enum(SHOP_REGION_GROUPS),
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().max(1000).nullable().optional(),
    isPublic: z.boolean().default(false),
    shops: z
      .array(courseShopSchema)
      .min(2, "코스에는 최소 2개의 상점이 필요합니다.")
      .max(10, "코스에는 최대 10개의 상점만 포함할 수 있습니다."),
  }),
});

/**
 * 코스 상세 조회 요청
 */
export const getCourseDetailSchema = z.object({
  params: z.object({
    courseId: objectIdSchema,
  }),
});

/** 코스 좋아요와 좋아요 해제 요청 */
export const courseLikeSchema = getCourseDetailSchema;

/**
 * 사용자 코스 수정 요청
 */
export const updateCourseSchema = z.object({
  params: z.object({
    courseId: objectIdSchema,
  }),

  body: z
    .object({
      title: z.string().trim().min(1).max(100).optional(),

      description: z.string().trim().max(1000).nullable().optional(),

      shops: z
        .array(courseShopSchema)
        .min(2, "코스에는 최소 2개의 상점이 필요합니다.")
        .max(10, "코스에는 최대 10개의 상점만 포함할 수 있습니다.")
        .optional(),
    })
    .refine(
      (body) =>
        body.title !== undefined ||
        body.description !== undefined ||
        body.shops !== undefined,
      {
        message: "수정할 값이 하나 이상 필요합니다.",
      },
    ),
});

/**
 * 사용자 코스 삭제 요청
 */
export const deleteCourseSchema = z.object({
  params: z.object({
    courseId: objectIdSchema,
  }),
});

/** 코스 공개 여부 변경 요청 */
export const updateCourseVisibilitySchema = z.object({
  params: z.object({
    courseId: objectIdSchema,
  }),
  body: z.object({
    isPublic: z.boolean(),
  }),
});

/** 내 코스와 찜한 코스가 공유하는 커서 목록 요청 */
export const getCourseListSchema = z.object({
  query: z.object({
    cursor: z.string().min(1).max(512).optional(),
    limit: z.coerce.number().int().min(1).max(20).default(20),
  }),
});
