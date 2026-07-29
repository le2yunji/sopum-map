export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ValidationErrorDetails = Record<string, string>;

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationErrorDetails;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
