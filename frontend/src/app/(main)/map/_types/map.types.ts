import type { ShopRegionGroup, TagKey } from "@sopum-map/shared";

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
