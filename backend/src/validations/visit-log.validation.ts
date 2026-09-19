// backend/src/validations/visit-log.validation.ts

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "올바른 ObjectId 형식이 아닙니다.");

export const getVisitLogsParamsSchema = z.object({
  shopId: objectIdSchema,
});

export const getVisitLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),
});
