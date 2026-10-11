import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

import { optimizeUserCourseRoute } from "../services/course-route/course-route.service.js";
import { optimizeCourseRouteSchema } from "../validations/course-route.validation.js";

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
