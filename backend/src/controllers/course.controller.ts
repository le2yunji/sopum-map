import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

import {
  createCourse,
  deleteCourse,
  getCourseDetail,
  getMyCourses,
  updateCourse,
} from "../services/course/course.service.js";

import {
  createCourseSchema,
  deleteCourseSchema,
  getCourseDetailSchema,
  updateCourseSchema,
} from "../validations/course.validation.js";

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

/**
 * 코스 상세 정보를 조회합니다.
 */
export async function getCourseDetailController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { courseId },
    } = res.locals.validated as z.infer<typeof getCourseDetailSchema>;

    const data = await getCourseDetail(userId, courseId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 내가 만든 사용자 코스 목록을 조회합니다.
 */
export async function getMyCoursesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const data = await getMyCourses(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 사용자 코스를 수정합니다.
 */
export async function updateCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { courseId },
      body,
    } = res.locals.validated as z.infer<typeof updateCourseSchema>;

    const data = await updateCourse(userId, courseId, body);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 사용자 코스를 삭제합니다.
 */
export async function deleteCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;

    const {
      params: { courseId },
    } = res.locals.validated as z.infer<typeof deleteCourseSchema>;

    await deleteCourse(userId, courseId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
