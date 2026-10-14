// backend/src/controllers/visit-log.controller.ts

import type { NextFunction, Request, Response } from "express";
import type {
  CreateVisitLogResponse,
  GetVisitLogsResponse,
} from "@sopum-map/shared";
import type { z } from "zod";

import { createVisitLog } from "../services/visit-log/visit-log.create.service.js";
import { getVisitLogs } from "../services/visit-log/visit-log.service.js";

import {
  createVisitLogSchema,
  getVisitLogsParamsSchema,
  getVisitLogsQuerySchema,
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
