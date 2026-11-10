import type {
  ShopMapBounds,
  ShopMapMarker,
  ShopRegionGroup,
  TagKey,
} from "@sopum-map/shared";

/** 화면에 표시된 지도의 남서·북동 경계입니다. */
export type MapBounds = ShopMapBounds;

/** 지도 마커 하나를 표시하는 데 필요한 상점 정보입니다. */
export type MapMarkerShop = Readonly<
  Pick<ShopMapMarker, "id" | "name" | "latitude" | "longitude">
>;

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
