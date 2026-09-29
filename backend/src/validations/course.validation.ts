import { z } from "zod";

import { objectIdSchema } from "./common.validation.js";

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

    title: z.string().trim().min(1).max(100),

    description: z.string().trim().max(1000).nullable().optional(),

    shops: z
      .array(courseShopSchema)
      .min(2, "코스에는 최소 2개의 상점이 필요합니다.")
      .max(10, "코스에는 최대 10개의 상점만 포함할 수 있습니다."),
  }),
});
