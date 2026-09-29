// backend/src/validations/visit-log.validation.ts

import { z } from "zod";
import { objectIdSchema } from "./common.validation.js";

export const getVisitLogsParamsSchema = z.object({
  shopId: objectIdSchema,
});

export const getVisitLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),
});
