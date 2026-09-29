import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

import { createCourse } from "../services/course/course.service.js";

import { createCourseSchema } from "../validations/course.validation.js";

/**
 * 내 픽 폴더를 기반으로 사용자 코스를 생성합니다.
 */
export async function createCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const { body } = res.locals.validated as z.infer<typeof createCourseSchema>;

    const data = await createCourse(userId, body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
