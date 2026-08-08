// api-error.ts

import type { ValidationErrorDetails } from "./api.types";

/**
 * API 전용 에러 객체를 만들고
 * 잡힌 에러가 API 에러인지 확인하기 위한 코드
 */
export type ApiError = Error & {
  status: number;
  code: string;
  details?: ValidationErrorDetails;
};

type CreateApiErrorParams = {
  status: number;
  code: string;
  message: string;
  details?: ValidationErrorDetails;
};

export const createApiError = ({
  status,
  code,
  message,
  details,
}: CreateApiErrorParams): ApiError => {
  return Object.assign(new Error(message), {
    name: "ApiError",
    status,
    code,
    details,
  });
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    error instanceof Error &&
    error.name === "ApiError" &&
    "status" in error &&
    typeof error.status === "number" &&
    "code" in error &&
    typeof error.code === "string"
  );
};
