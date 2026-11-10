import type { ShopMapBounds, ShopRegionGroup, TagKey } from "@sopum-map/shared";

/** 화면에 표시된 지도의 남서·북동 경계입니다. */
export type MapBounds = ShopMapBounds;

export type MapShop = {
  id: string;
  name: string;
  address: string;
  regionGroup: ShopRegionGroup;
  tags: TagKey[];
  imageUrl: string;
  isLiked: boolean;
  latitude: number;
  longitude: number;
};

export type MapSdkState = "loading" | "ready" | "error" | "missing-key";
