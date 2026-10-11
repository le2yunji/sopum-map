import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

import { optimizeUserCourseRoute } from "../services/course-route/course-route.service.js";
import {
  getCourseWalkingRouteSchema,
  optimizeCourseRouteSchema,
} from "../validations/course-route.validation.js";
import { getWalkingRouteByCourse } from "../services/course-route/course-route-read.service.js";

/**
 * 선택한 상점들의 추천 방문 순서를 계산합니다.
 */
export async function optimizeCourseRouteController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const { body } = res.locals.validated as z.infer<
      typeof optimizeCourseRouteSchema
    >;

    const data = await optimizeUserCourseRoute({
      userId,
      input: body,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 저장된 Course 순서 기준
 * 실제 도보 경로 조회
 */
export async function getCourseWalkingRouteController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { courseId },
    } = res.locals.validated as z.infer<typeof getCourseWalkingRouteSchema>;

    const data = await getWalkingRouteByCourse(userId, courseId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
