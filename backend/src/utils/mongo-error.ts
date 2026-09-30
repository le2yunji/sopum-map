/**
 * MongoDB duplicate key error인지 확인합니다.
 *
 * unique index 충돌 시 error.code === 11000이 발생합니다.
 */
export function isMongoDuplicateKeyError(
  error: unknown,
): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}
