// backend/src/controllers/visit-log.controller.ts

import type { NextFunction, Request, Response } from "express";
import type {
  CreateVisitLogResponse,
  DeleteVisitLogResponse,
  GetMyVisitLogResponse,
  GetMyVisitLogsResponse,
  GetVisitLogsResponse,
  UpdateVisitLogResponse,
} from "@sopum-map/shared";
import type { z } from "zod";

import { createVisitLog } from "../services/visit-log/visit-log.create.service.js";
import { getVisitLogs } from "../services/visit-log/visit-log.service.js";
import {
  deleteVisitLog,
  getMyVisitLog,
  getMyVisitLogs,
  updateVisitLog,
} from "../services/visit-log/visit-log.manage.service.js";

import {
  createVisitLogSchema,
  deleteVisitLogSchema,
  getMyVisitLogSchema,
  getMyVisitLogsSchema,
  getVisitLogsParamsSchema,
  getVisitLogsQuerySchema,
  updateVisitLogSchema,
} from "../validations/visit-log.validation.js";

/** 로그인 사용자의 방문 로그를 생성합니다. */
export async function createVisitLogController(
  req: Request,
  res: Response<CreateVisitLogResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const { params, body } = res.locals.validated as z.infer<
      typeof createVisitLogSchema
    >;
    const data = await createVisitLog(userId, params.shopId, body);

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getVisitLogsController(
  req: Request,
  res: Response<GetVisitLogsResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { shopId } = getVisitLogsParamsSchema.parse(req.params);

    const query = getVisitLogsQuerySchema.parse(req.query);

    const data = await getVisitLogs({
      shopId,
      userId: req.auth?.userId,
      ...query,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/** 로그인 사용자의 활성 방문 로그 목록을 반환합니다. */
export async function getMyVisitLogsController(
  req: Request,
  res: Response<GetMyVisitLogsResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { query } = res.locals.validated as z.infer<typeof getMyVisitLogsSchema>;
    const data = await getMyVisitLogs({ userId: req.auth!.userId, ...query });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** 수정 화면에 본인 활성 방문 로그 한 건을 반환합니다. */
export async function getMyVisitLogController(
  req: Request,
  res: Response<GetMyVisitLogResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { params } = res.locals.validated as z.infer<typeof getMyVisitLogSchema>;
    const data = await getMyVisitLog(req.auth!.userId, params.visitLogId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** 본인 활성 방문 로그의 수정 가능한 값만 갱신합니다. */
export async function updateVisitLogController(
  req: Request,
  res: Response<UpdateVisitLogResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { params, body } = res.locals.validated as z.infer<typeof updateVisitLogSchema>;
    const data = await updateVisitLog(req.auth!.userId, params.visitLogId, body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** 본인 활성 방문 로그를 소프트 삭제합니다. */
export async function deleteVisitLogController(
  req: Request,
  res: Response<DeleteVisitLogResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { params } = res.locals.validated as z.infer<typeof deleteVisitLogSchema>;
    const data = await deleteVisitLog(req.auth!.userId, params.visitLogId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
