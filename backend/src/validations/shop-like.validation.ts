import { createPaginationQuerySchema } from "./pagination.validation.js";

export const likedShopsQuerySchema = createPaginationQuerySchema({
  defaultLimit: 20,
  maxLimit: 50,
});
