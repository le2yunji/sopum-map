import { Router } from "express";

import {
  createCourseController,
  deleteCourseController,
  getCourseDetailController,
  likeCourseController,
  unlikeCourseController,
  updateCourseController,
  updateCourseVisibilityController,
  setCourseShopVisitedController,
  unsetCourseShopVisitedController,
} from "../controllers/course.controller.js";
import { getCourseWalkingRouteController } from "../controllers/course-route.controller.js";

import { requireAuth } from "../middlewares/require-auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";

import {
  createCourseSchema,
  courseLikeSchema,
  deleteCourseSchema,
  getCourseDetailSchema,
  updateCourseSchema,
  updateCourseVisibilitySchema,
  courseShopVisitSchema,
} from "../validations/course.validation.js";

const courseRouter = Router();

/** 코스 상점을 방문 완료 상태로 저장합니다. */
courseRouter.put(
  "/:courseId/shops/:shopId/visit",
  requireAuth,
  validateRequest(courseShopVisitSchema),
  setCourseShopVisitedController,
);

/** 코스 상점을 미방문 상태로 되돌립니다. */
courseRouter.delete(
  "/:courseId/shops/:shopId/visit",
  requireAuth,
  validateRequest(courseShopVisitSchema),
  unsetCourseShopVisitedController,
);

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
 * 코스 좋아요
 *
 * POST /api/courses/:courseId/likes
 */
courseRouter.post(
  "/:courseId/likes",
  requireAuth,
  validateRequest(courseLikeSchema),
  likeCourseController,
);

/**
 * 코스 좋아요 해제
 *
 * DELETE /api/courses/:courseId/likes
 */
courseRouter.delete(
  "/:courseId/likes",
  requireAuth,
  validateRequest(courseLikeSchema),
  unlikeCourseController,
);

/**
 * 사용자 코스 공개 여부 변경
 *
 * PATCH /api/courses/:courseId/visibility
 */
courseRouter.patch(
  "/:courseId/visibility",
  requireAuth,
  validateRequest(updateCourseVisibilitySchema),
  updateCourseVisibilityController,
);

/** 저장된 코스의 실제 도보 경로 조회 */
courseRouter.get(
  "/:courseId/walking-route",
  requireAuth,
  validateRequest(getCourseDetailSchema),
  getCourseWalkingRouteController,
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
