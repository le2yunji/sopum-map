import {
  MAX_COURSE_SHOPS,
  type CourseShopInput,
} from "@sopum-map/shared";

import type { CourseEditorShopOption } from "./CourseEditor";

/** 새 코스에서 최대 개수까지의 상점을 기본 방문 순서로 선택합니다. */
export function createInitialCourseShopInputs(
  shops: readonly CourseEditorShopOption[],
): CourseShopInput[] {
  return shops.slice(0, MAX_COURSE_SHOPS).map((shop, index) => ({
    shopId: shop.id,
    order: index + 1,
    memo: null,
  }));
}

/** 선택한 상점은 방문 순서대로 앞에 두고 미선택 상점은 기존 순서를 유지합니다. */
export function orderCourseShopOptions(
  shops: readonly CourseEditorShopOption[],
  selectedShops: readonly CourseShopInput[],
): CourseEditorShopOption[] {
  const shopById = new Map(shops.map((shop) => [shop.id, shop]));
  const selectedShopIds = new Set(selectedShops.map((shop) => shop.shopId));
  const selectedOptions = [...selectedShops]
    .sort((first, second) => first.order - second.order)
    .flatMap((selectedShop) => {
      const shop = shopById.get(selectedShop.shopId);
      return shop ? [shop] : [];
    });
  const unselectedOptions = shops.filter(
    (shop) => !selectedShopIds.has(shop.id),
  );

  return [...selectedOptions, ...unselectedOptions];
}
