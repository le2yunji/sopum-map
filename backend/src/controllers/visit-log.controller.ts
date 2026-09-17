// backend/src/controllers/visit-log.controller.ts

import type { NextFunction, Request, Response } from "express";
import type { GetVisitLogsResponse } from "@sopum-map/shared";

import { getVisitLogs } from "../services/visit-log/visit-log.service.js";

import {
  getVisitLogsParamsSchema,
  getVisitLogsQuerySchema,
} from "../validations/visit-log.validation.js";

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
