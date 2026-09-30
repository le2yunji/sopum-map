import { ShopStatus } from "@sopum-map/shared";

/**
 * 코스 상세 화면에서 현재 이용 불가능한
 * 상점 상태인지 확인합니다.
 *
 * hidden은 검색 노출만 제한된 상태이므로
 * 이용 불가 상점으로 처리하지 않습니다.
 */
export function isCourseShopUnavailable(status: ShopStatus): boolean {
  return status === "temporarily_closed" || status === "closed";
}
