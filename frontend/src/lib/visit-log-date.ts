const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 한국 시간 기준 날짜를 날짜 입력에 사용할 형식으로 반환합니다. */
export function getTodayDateInputValue(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 방문일을 날짜가 바뀔 위험이 적은 한국 정오의 ISO 시각으로 변환합니다. */
export function toVisitLogIsoDate(
  dateValue: string,
  todayValue = getTodayDateInputValue(),
): string {
  if (!DATE_VALUE_PATTERN.test(dateValue) || dateValue > todayValue) {
    throw new Error("방문일을 올바르게 입력해 주세요.");
  }

  const date = new Date(`${dateValue}T12:00:00+09:00`);
  const formattedDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  if (Number.isNaN(date.getTime()) || formattedDate !== dateValue) {
    throw new Error("방문일을 올바르게 입력해 주세요.");
  }

  return date.toISOString();
}
