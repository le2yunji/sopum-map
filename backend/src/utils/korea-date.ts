const KOREA_TIME_ZONE_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1_000;

/** 시각을 한국 표준시 기준의 달력 날짜 키로 변환합니다. */
export function toKoreaDateKey(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("유효한 방문일이 필요합니다.");
  }

  return new Date(date.getTime() + KOREA_TIME_ZONE_OFFSET_MILLISECONDS)
    .toISOString()
    .slice(0, 10);
}
