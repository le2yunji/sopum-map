import { z } from "zod";

/**
 * MongoDB ObjectId 문자열을 검증합니다.
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "유효한 ObjectId 형식이 아닙니다.");
