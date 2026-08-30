import {
  SHOP_REGION_GROUP_LABELS,
  TAG_SHORT_LABELS,
  type ShopListItem,
} from "@sopum-map/shared";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

/**
 * Shop 목록 API 응답을 홈 ShopCard 데이터로 변환합니다.
 */
export const toHomeShopCardItem = (shop: ShopListItem) => {
  return {
    id: shop.id,

    name: shop.name,

    imageUrl: shop.mainImageUrl ?? DEFAULT_SHOP_IMAGE,

    region: SHOP_REGION_GROUP_LABELS[shop.regionGroup],

    tags: shop.tags.slice(0, 3).map((tag) => TAG_SHORT_LABELS[tag.key]),

    isLiked: shop.isLiked,
  };
};
