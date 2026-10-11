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
import { getCourseWalkingRouteSchema } from "../validations/course-route.validation.js";
import { getCourseWalkingRouteController } from "../controllers/course-route.controller.js";

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

/**
 * 저장된 코스의 실제 도보 경로 조회
 *
 * GET /api/courses/:courseId/walking-route
 */
courseRouter.get(
  "/:courseId/walking-route",
  requireAuth,
  validateRequest(getCourseWalkingRouteSchema),
  getCourseWalkingRouteController,
);

export { courseRouter };
