import { Router } from "express";

import {
  createCourseController,
  deleteCourseController,
  getCourseDetailController,
  updateCourseController,
} from "../controllers/course.controller.js";

import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";

import {
  createCourseSchema,
  deleteCourseSchema,
  getCourseDetailSchema,
  updateCourseSchema,
} from "../validations/course.validation.js";

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

/**
 * 코스 상세 조회
 *
 * GET /api/courses/:courseId
 */
courseRouter.get(
  "/:courseId",
  requireAuth,
  validateRequest(getCourseDetailSchema),
  getCourseDetailController,
);

/**
 * 사용자 코스 수정
 *
 * PATCH /api/courses/:courseId
 */
courseRouter.patch(
  "/:courseId",
  requireAuth,
  validateRequest(updateCourseSchema),
  updateCourseController,
);

/**
 * 사용자 코스 삭제
 *
 * DELETE /api/courses/:courseId
 */
courseRouter.delete(
  "/:courseId",
  requireAuth,
  validateRequest(deleteCourseSchema),
  deleteCourseController,
);

export { courseRouter };
