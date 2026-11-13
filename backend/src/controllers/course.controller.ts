import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import {
  createCourseSchema,
  deleteCourseSchema,
  getCourseDetailSchema,
  getCourseListSchema,
  getPublicCoursesSchema,
  updateCourseSchema,
  updateCourseVisibilitySchema,
  courseShopVisitSchema,
} from "../validations/course.validation.js";
import { createCourse } from "../services/course/course.create.service.js";
import { getCourseDetail } from "../services/course/course.read.service.js";
import {
  getMyCourseList,
  getMyLikedCourseList,
} from "../services/course/course-list.service.js";
import { getPublicCourseList } from "../services/course/public-course-list.service.js";
import { updateCourse } from "../services/course/course.update.service.js";
import { deleteCourse } from "../services/course/course.delete.service.js";
import {
  likeCourse,
  unlikeCourse,
} from "../services/course/course-like.service.js";
import { updateCourseVisibility } from "../services/course/course-visibility.service.js";
import {
  setCourseShopVisited,
  unsetCourseShopVisited,
} from "../services/course/course-shop-visit.service.js";
import { getHomeCourseRecommendations } from "../services/course/course-home.service.js";

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

/** 공개 코스를 지역과 정렬 조건에 따라 조회합니다. */
export async function getPublicCoursesController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { query } = res.locals.validated as z.infer<
      typeof getPublicCoursesSchema
    >;

    const data = await getPublicCourseList(query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/** 모든 사용자에게 같은 오늘의 홈 추천 코스를 반환합니다. */
export async function getHomeCourseRecommendationsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getHomeCourseRecommendations();

    res.status(200).json({
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

    const { query } = res.locals.validated as z.infer<
      typeof getCourseListSchema
    >;

    const data = await getMyCourseList(userId, query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/** 내가 좋아요한 코스 목록을 커서 기반으로 조회합니다. */
export async function getMyLikedCoursesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { query } = res.locals.validated as z.infer<
      typeof getCourseListSchema
    >;

    const data = await getMyLikedCourseList(userId, query);

    res.status(200).json({ success: true, data });
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

/** 공개된 다른 사용자의 코스를 좋아요합니다. */
export async function likeCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const {
      params: { courseId },
    } = res.locals.validated as z.infer<typeof getCourseDetailSchema>;

    const data = await likeCourse(userId, courseId);

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** 현재 사용자의 코스 좋아요를 해제합니다. */
export async function unlikeCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const {
      params: { courseId },
    } = res.locals.validated as z.infer<typeof getCourseDetailSchema>;

    const data = await unlikeCourse(userId, courseId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** 작성자가 사용자 코스의 공개 여부를 변경합니다. */
export async function updateCourseVisibilityController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const {
      params: { courseId },
      body: { isPublic },
    } = res.locals.validated as z.infer<typeof updateCourseVisibilitySchema>;

    const data = await updateCourseVisibility(userId, courseId, isPublic);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** 코스 상점을 방문 완료 상태로 저장합니다. */
export async function setCourseShopVisitedController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { params } = res.locals.validated as z.infer<
      typeof courseShopVisitSchema
    >;
    const data = await setCourseShopVisited(
      userId,
      params.courseId,
      params.shopId,
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** 코스 상점을 미방문 상태로 되돌립니다. */
export async function unsetCourseShopVisitedController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { params } = res.locals.validated as z.infer<
      typeof courseShopVisitSchema
    >;
    const data = await unsetCourseShopVisited(
      userId,
      params.courseId,
      params.shopId,
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
