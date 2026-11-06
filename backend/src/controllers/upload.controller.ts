import type {
  CreateVisitLogImageUploadResponse,
} from "@sopum-map/shared";
import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { createVisitLogImageUpload } from "../services/upload/upload.service.js";
import { createVisitLogImageUploadSchema } from "../validations/upload.validation.js";

/** 로그인 사용자의 방문 로그 이미지 업로드 서명을 발급합니다. */
export async function createVisitLogImageUploadController(
  req: Request,
  res: Response<CreateVisitLogImageUploadResponse>,
  next: NextFunction,
): Promise<void> {
  try {
    const { body } = res.locals.validated as z.infer<
      typeof createVisitLogImageUploadSchema
    >;
    const data = await createVisitLogImageUpload(req.auth!.userId, body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
