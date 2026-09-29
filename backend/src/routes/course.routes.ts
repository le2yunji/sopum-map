import { Router } from "express";

import { createCourseController } from "../controllers/course.controller.js";

import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";

import { createCourseSchema } from "../validations/course.validation.js";

const courseRouter = Router();

/**
 * 사용자 코스 생성
 *
 * POST /api/courses
 */
courseRouter.post(
  "/",
  requireAuth,
  validateRequest(createCourseSchema),
  createCourseController,
);

export { courseRouter };
