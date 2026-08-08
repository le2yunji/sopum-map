import { createApiError, type ApiResponse } from "@sopum-map/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type FetcherOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * 공통 API 요청을 실행하고 성공 응답의 data를 반환합니다.
 *
 * @template T 반환할 데이터 타입
 * @param path 요청할 API 경로
 * @param options fetch 요청 옵션
 * @returns API 성공 응답 데이터
 * @throws 요청 실패 시 ApiError
 */

export const fetcher = async <T>(
  path: string,
  options: FetcherOptions = {},
): Promise<T> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.");
  }

  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // DELETE 등의 204 No Content 응답 처리
  if (response.status === 204) {
    return undefined as T;
  }

  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    if (result && !result.success) {
      throw createApiError({
        status: response.status,
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
      });
    }

    throw createApiError({
      status: response.status,
      code: "HTTP_ERROR",
      message: "API 요청에 실패했습니다.",
    });
  }

  if (!result) {
    throw createApiError({
      status: response.status,
      code: "INVALID_RESPONSE",
      message: "서버 응답 형식이 올바르지 않습니다.",
    });
  }

  if (!result.success) {
    throw createApiError({
      status: response.status,
      code: result.error.code,
      message: result.error.message,
      details: result.error.details,
    });
  }

  return result.data;
};
