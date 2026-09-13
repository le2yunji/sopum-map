import { z } from "zod";

type CreatePaginationQuerySchemaOptions = {
  defaultLimit: number;
  maxLimit: number;
};

export const createPaginationQuerySchema = ({
  defaultLimit,
  maxLimit,
}: CreatePaginationQuerySchemaOptions) =>
  z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
  });
