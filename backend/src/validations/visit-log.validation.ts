// backend/src/validations/visit-log.validation.ts

import { z } from "zod";
import {
  TAG_KEYS,
  VISIT_LOG_CONTENT_MAX_LENGTH,
  VISIT_LOG_IMAGE_MAX_COUNT,
  VISIT_LOG_TAG_MAX_COUNT,
  type TagKey,
} from "@sopum-map/shared";
import { objectIdSchema } from "./common.validation.js";

const TAG_KEY_SET = new Set<string>(TAG_KEYS);

const visitLogTagKeySchema = z.custom<TagKey>(
  (value) => typeof value === "string" && TAG_KEY_SET.has(value),
  "정의되지 않은 방문 태그입니다.",
);

/** 주어진 시각을 서비스 기준인 한국 달력 날짜로 변환합니다. */
function formatKoreanDate(value: Date): string {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

/** 방문 시각이 한국 달력 기준 미래 날짜가 아닌지 확인합니다. */
const visitedAtSchema = z.iso
  .datetime()
  .refine((value) => formatKoreanDate(new Date(value)) <= formatKoreanDate(new Date()), {
    message: "방문일은 미래일 수 없습니다.",
  });

export const checkVisitLogAvailabilitySchema = z.object({
  params: z.object({
    shopId: objectIdSchema,
  }),
  query: z.object({
    visitedAt: visitedAtSchema,
  }),
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
      .max(VISIT_LOG_TAG_MAX_COUNT)
      .refine((tagKeys) => new Set(tagKeys).size === tagKeys.length, {
        message: "방문 태그는 중복될 수 없습니다.",
      }),
    content: z
      .string()
      .trim()
      .max(VISIT_LOG_CONTENT_MAX_LENGTH)
      .nullable()
      .optional(),
    imageUploadIds: z
      .array(objectIdSchema)
      .max(VISIT_LOG_IMAGE_MAX_COUNT)
      .refine((uploadIds) => new Set(uploadIds).size === uploadIds.length, {
        message: "같은 이미지는 중복 등록할 수 없습니다.",
      })
      .default([]),
  }),
});

export const getVisitLogsParamsSchema = z.object({
  shopId: objectIdSchema,
});

export const getVisitLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const visitLogIdParamsSchema = z.object({
  visitLogId: objectIdSchema,
});

export const getMyVisitLogsSchema = z.object({
  query: getVisitLogsQuerySchema,
});

export const getMyVisitLogSchema = z.object({
  params: visitLogIdParamsSchema,
});

export const updateVisitLogSchema = z.object({
  params: visitLogIdParamsSchema,
  body: createVisitLogSchema.shape.body.omit({ imageUploadIds: true }).extend({
    images: z
      .array(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("existing"), key: z.string().min(1) }),
          z.object({ type: z.literal("new"), uploadId: objectIdSchema }),
        ]),
      )
      .max(VISIT_LOG_IMAGE_MAX_COUNT)
      .optional(),
  }),
});

export const deleteVisitLogSchema = z.object({
  params: visitLogIdParamsSchema,
});
