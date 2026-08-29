import type {
  GetShopDetailResponse,
  GetShopsResponse,
} from "@sopum-map/shared";

import type { MapShop } from "../_types/map.types";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

type ShopListItem = GetShopsResponse["data"]["items"][number];

type ShopDetail = GetShopDetailResponse["data"];

type MapShopSource = ShopListItem | ShopDetail;

/** 상점 API 데이터를 지도 화면 전용 타입으로 변환합니다. */
export function toMapShop(shop: MapShopSource): MapShop {
  return {
    id: shop.id,
    name: shop.name,
    address: shop.address,
    regionGroup: shop.regionGroup,

    latitude: shop.latitude,
    longitude: shop.longitude,

    imageUrl: shop.mainImageUrl ?? DEFAULT_IMAGES["shop"],

    tags: shop.tags.map((tag) => tag.key),

    isLiked: shop.isLiked,
  };
}
