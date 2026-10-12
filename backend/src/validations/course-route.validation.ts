import { z } from "zod";

import { SHOP_REGION_GROUPS } from "@sopum-map/shared";

import { objectIdSchema } from "./common.validation.js";

export const optimizeCourseRouteSchema = z.object({
  body: z.object({
    sourceFolderId: objectIdSchema,
    regionGroup: z.enum(SHOP_REGION_GROUPS),
    shopIds: z
      .array(objectIdSchema)
      .min(2, "코스에는 상점이 2개 이상 필요합니다.")
      .max(10, "코스에는 상점을 최대 10개까지 선택할 수 있습니다.")
      .refine((shopIds) => new Set(shopIds).size === shopIds.length, {
        message: "중복된 상점이 포함되어 있습니다.",
      }),
    startShopId: objectIdSchema.optional(),
  }),
}).superRefine(({ body }, context) => {
  if (body.startShopId && !body.shopIds.includes(body.startShopId)) {
    context.addIssue({
      code: "custom",
      path: ["body", "startShopId"],
      message: "첫 방문 상점은 선택한 상점에 포함되어야 합니다.",
    });
  }
});
