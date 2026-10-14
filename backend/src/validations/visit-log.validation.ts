// backend/src/validations/visit-log.validation.ts

import { z } from "zod";
import { TAG_KEYS, type TagKey } from "@sopum-map/shared";
import { objectIdSchema } from "./common.validation.js";

const TAG_KEY_SET = new Set<string>(TAG_KEYS);

const visitLogTagKeySchema = z.custom<TagKey>(
  (value) => typeof value === "string" && TAG_KEY_SET.has(value),
  "정의되지 않은 방문 태그입니다.",
);

/** 현재보다 미래인 방문 시각이 저장되지 않게 합니다. */
const visitedAtSchema = z.iso
  .datetime()
  .refine((value) => new Date(value).getTime() <= Date.now(), {
    message: "방문일은 미래일 수 없습니다.",
  });

export const createVisitLogSchema = z.object({
  params: z.object({
    shopId: objectIdSchema,
  }),
  body: z.object({
    visitedAt: visitedAtSchema,
    selectedTagKeys: z
      .array(visitLogTagKeySchema)
      .min(1)
      .max(5)
      .refine((tagKeys) => new Set(tagKeys).size === tagKeys.length, {
        message: "방문 태그는 중복될 수 없습니다.",
      }),
    content: z.string().trim().max(300).nullable().optional(),
    imageKeys: z.array(z.string()).max(0).default([]),
  }),
});

export const getVisitLogsParamsSchema = z.object({
  shopId: objectIdSchema,
});

export const getVisitLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),
});
