import { Router } from "express";

import {
  deleteVisitLogController,
  updateVisitLogController,
} from "../controllers/visit-log.controller.js";
import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import {
  deleteVisitLogSchema,
  updateVisitLogSchema,
} from "../validations/visit-log.validation.js";

export const visitLogRouter = Router();

/** PATCH /api/visit-logs/:visitLogId */
visitLogRouter.patch(
  "/:visitLogId",
  requireAuth,
  validateRequest(updateVisitLogSchema),
  updateVisitLogController,
);

/** DELETE /api/visit-logs/:visitLogId */
visitLogRouter.delete(
  "/:visitLogId",
  requireAuth,
  validateRequest(deleteVisitLogSchema),
  deleteVisitLogController,
);
