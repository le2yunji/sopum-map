import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ValidationErrorDetails,
} from "@sopum-map/shared";

export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => {
  return {
    success: true,
    data,
  };
};

export const createErrorResponse = (
  code: string,
  message: string,
  details?: ValidationErrorDetails,
): ApiErrorResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
};
