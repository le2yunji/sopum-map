import type { NextFunction, Request, Response } from "express";

import type { ZodType } from "zod";

/**
 * params, query, body를 Zod schema로 검증합니다.
 */
export function validateRequest(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      params: req.params,
      query: req.query,
      body: req.body,
    });

    if (!result.success) {
      res.status(400).json({
        success: false,

        error: {
          code: "VALIDATION_ERROR",
          message: "요청 값이 올바르지 않습니다.",

          details: result.error.flatten(),
        },
      });

      return;
    }

    /**
     * trim, coerce, default 등 Zod 변환 결과를
     * Controller에서 사용할 수 있도록 저장합니다.
     */
    res.locals.validated = result.data;

    next();
  };
}
