import {
  isApiError,
  type ApiErrorResponse,
  type ValidationErrorDetails,
} from "@sopum-map/shared";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

const getZodErrorDetails = (error: ZodError): ValidationErrorDetails => {
  return error.issues.reduce<ValidationErrorDetails>((details, issue) => {
    const field = issue.path.join(".") || "request";

    /*
     * 동일 필드에 오류가 여러 개 발생하면
     * 첫 번째 오류 메시지만 사용한다.
     */
    if (!details[field]) {
      details[field] = issue.message;
    }

    return details;
  }, {});
};

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  /*
   * 서비스나 컨트롤러에서 의도적으로 발생시킨 API 오류
   */
  if (isApiError(error)) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };

    res.status(error.status).json(response);
    return;
  }

  /*
   * Zod 요청 데이터 검증 오류
   */
  if (error instanceof ZodError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "요청 데이터 형식이 올바르지 않습니다.",
        details: getZodErrorDetails(error),
      },
    };

    res.status(400).json(response);
    return;
  }

  /*
   * 예상하지 못한 오류만 서버 로그에 남긴다.
   */
  console.error(error);

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "서버 내부 오류가 발생했습니다.",
    },
  };

  res.status(500).json(response);
};
