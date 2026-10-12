import {
  createApiError,
  type CreateCourseRequest,
  type ShopRegionGroup,
  type ShopStatus,
} from "@sopum-map/shared";
import { Types } from "mongoose";

type CourseShopInput = CreateCourseRequest["shops"][number];

type CourseShopForValidation = Readonly<{
  _id?: Types.ObjectId;
  regionGroup?: unknown;
  status?: unknown;
  location?: {
    coordinates?: unknown;
  } | null;
}>;

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

/**
 * 상점에 코스 계산에 사용할 수 있는 좌표가 있는지 확인
 */
export function hasCourseShopLocation(shop: CourseShopForValidation): boolean {
  const { latitude, longitude } = getCourseShopCoordinates(shop);

  return latitude !== null && longitude !== null;
}

/** 현재 위치가 없는 기존 상점도 상세 화면에서 안전하게 표현합니다. */
export function getCourseShopCoordinates(shop: CourseShopForValidation): {
  latitude: number | null;
  longitude: number | null;
} {
  const coordinates = shop.location?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return {
      latitude: null,
      longitude: null,
    };
  }

  const [longitude, latitude] = coordinates;

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude)
  ) {
    return {
      latitude: null,
      longitude: null,
    };
  }

  return {
    latitude,
    longitude,
  };
}

/**
 * 코스에 새로 추가할 수 있는 상점인지 검증
 *
 * - 코스의 regionGroup과 동일해야 함
 * - active / temporarily_closed는 추가할 수 있음
 * - hidden / closed는 새로 추가할 수 없음
 * - 위치 정보가 반드시 있어야 함
 */
export function validateNewCourseShop(
  shop: CourseShopForValidation,
  regionGroup: ShopRegionGroup,
): void {
  if (shop.regionGroup !== regionGroup) {
    throw createApiError({
      status: 400,
      code: "COURSE_REGION_MISMATCH",
      message: "코스에는 같은 지역의 상점만 추가할 수 있습니다.",
    });
  }

  if (shop.status === "hidden") {
    throw createApiError({
      status: 400,
      code: "COURSE_SHOP_HIDDEN",
      message: "숨김 처리된 상점은 코스에 새로 추가할 수 없습니다.",
    });
  }

  if (shop.status === "closed") {
    throw createApiError({
      status: 400,
      code: "COURSE_SHOP_CLOSED",
      message: "폐점한 상점은 코스에 새로 추가할 수 없습니다.",
    });
  }

  if (!hasCourseShopLocation(shop)) {
    throw createApiError({
      status: 400,
      code: "COURSE_SHOP_LOCATION_REQUIRED",
      message: "위치 정보가 없는 상점은 코스에 추가할 수 없습니다.",
    });
  }
}

/**
 * 이미 코스가 존재하는 경우 409 오류를 발생시킴
 */
export function throwCourseAlreadyExists(courseId: string): never {
  throw createApiError({
    status: 409,
    code: "COURSE_ALREADY_EXISTS",
    message: "해당 내 픽 폴더로 만든 코스가 이미 존재합니다.",
    details: {
      courseId,
    },
  });
}

/**
 * 코스 상점의 중복 여부와 방문 순서를 검증
 */
export function validateCourseShops(shops: readonly CourseShopInput[]): void {
  const shopIds = shops.map((shop) => shop.shopId);

  if (new Set(shopIds).size !== shopIds.length) {
    throw createApiError({
      status: 400,
      code: "DUPLICATE_COURSE_SHOP",
      message: "같은 상점을 코스에 중복으로 포함할 수 없습니다.",
    });
  }

  const orders = shops.map((shop) => shop.order).sort((a, b) => a - b);

  const hasInvalidOrder = orders.some((order, index) => order !== index + 1);

  if (hasInvalidOrder) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_SHOP_ORDER",
      message: "방문 순서는 1부터 연속된 숫자여야 합니다.",
    });
  }
}
