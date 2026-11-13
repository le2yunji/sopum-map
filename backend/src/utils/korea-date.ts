import { HOME_COURSE_SNAPSHOT_RETENTION_DAYS } from "../constants/course-home.constants.js";

const KOREA_TIME_ZONE_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1_000;

export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;

/** 시각을 한국 표준시 기준의 달력 날짜 키로 변환합니다. */
export function toKoreaDateKey(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("유효한 방문일이 필요합니다.");
  }

  return new Date(date.getTime() + KOREA_TIME_ZONE_OFFSET_MILLISECONDS)
    .toISOString()
    .slice(0, 10);
}

/** 한국 날짜의 시작·다음 시작·추천 스냅샷 만료 시각을 계산합니다. */
export function getKoreaDayWindow(date: Date): Readonly<{
  dateKey: string;
  startAt: Date;
  nextStartAt: Date;
  expiresAt: Date;
}> {
  const dateKey = toKoreaDateKey(date);

  const startAt = new Date(`${dateKey}T00:00:00+09:00`);

  const nextStartAt = new Date(startAt.getTime() + MILLISECONDS_PER_DAY);

  const expiresAt = new Date(
    startAt.getTime() +
      HOME_COURSE_SNAPSHOT_RETENTION_DAYS * MILLISECONDS_PER_DAY,
  );

  return {
    dateKey,
    startAt,
    nextStartAt,
    expiresAt,
  };
}
