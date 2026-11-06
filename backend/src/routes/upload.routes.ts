import { Router } from "express";

import { createVisitLogImageUploadController } from "../controllers/upload.controller.js";
import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { createVisitLogImageUploadSchema } from "../validations/upload.validation.js";

export const uploadRouter = Router();

uploadRouter.post(
  "/presign",
  requireAuth,
  validateRequest(createVisitLogImageUploadSchema),
  createVisitLogImageUploadController,
);
