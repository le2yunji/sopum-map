// api.types.ts

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ValidationErrorDetails = Record<string, string>;

export type ApiErrorData = {
  code: string;
  message: string;
  details?: ValidationErrorDetails;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorData;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
