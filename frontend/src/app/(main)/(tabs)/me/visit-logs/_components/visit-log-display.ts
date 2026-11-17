/** ISO 방문일을 한국어 달력 날짜로 표시합니다. */
export function formatVisitLogDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
