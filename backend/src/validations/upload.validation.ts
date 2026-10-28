import {
  VISIT_LOG_IMAGE_MAX_BYTES,
  VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE,
} from "@sopum-map/shared";
import { z } from "zod";

export const createVisitLogImageUploadSchema = z.object({
  body: z.object({
    contentType: z.literal(VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE),
    fileSize: z.number().int().min(1).max(VISIT_LOG_IMAGE_MAX_BYTES),
  }),
});
