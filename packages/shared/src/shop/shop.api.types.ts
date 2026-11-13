// shop.api.types.ts
import type { ApiSuccessResponse, Pagination } from "../api/api.types";
import type { TagGroup, TagKey } from "../tag";
import { SHOP_SORTS } from "./shop.constants";

import type {
  ShopBusinessDay,
  ShopCategory,
  ShopImageSourceType,
  ShopRegionGroup,
  ShopSourceType,
  ShopStatus,
} from "./shop.types";

export type ShopSort = (typeof SHOP_SORTS)[number];

/** 지도 화면에 표시된 직사각형 영역입니다. */
export type ShopMapBounds = Readonly<{
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
}>;

export type GetShopsQuery = Readonly<{
  bounds?: ShopMapBounds;
  category?: ShopCategory;
  tagKeys?: TagKey[];
  keyword?: string;
  regionGroup?: ShopRegionGroup;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sort?: ShopSort;
}>;

/** 현재 지도 영역의 마커 조회 조건입니다. */
export type GetShopMapQuery = Readonly<{
  bounds: ShopMapBounds;
  keyword?: string;
  tagKeys?: TagKey[];
}>;

export type ShopTag = Readonly<{
  key: TagKey;
  count: number;
  label: string;
  group: TagGroup;
}>;

export type ShopImage = {
  imageUrl: string;
  altText: string;
  sourceUrl: string | null;
  sourceType: ShopImageSourceType;
  isMain: boolean;
  order: number;
};

export type ShopBaseData = {
  id: string;
  category: ShopCategory;
  tags: ShopTag[];
  name: string;
  address: string;

  mainImageUrl: string | null;

  region1: string;
  region2: string;
  region3: string | null;
  regionGroup: ShopRegionGroup;

  latitude: number;
  longitude: number;

  status: ShopStatus;
  likeCount: number;
  visitLogCount: number;

  isLiked: boolean;
};

export type ShopListItem = ShopBaseData & {
  distanceMeters?: number;
};

export type ShopListData = {
  items: ShopListItem[];
  pagination: Pagination;
};

/** 지도 마커 하나를 표시하는 데 필요한 상점 정보입니다. */
export type ShopMapMarker = Readonly<{
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isLiked: boolean;
}>;

/** 현재 지도 영역의 상점 마커 조회 결과입니다. */
export type ShopMapData = Readonly<{
  items: ShopMapMarker[];
  isTruncated: boolean; // 일부만 반환됐는지 여부
}>;

export type ShopBusinessPeriod = Readonly<{
  open: string;
  close: string;
}>;

export type ShopBusinessHour = Readonly<{
  day: ShopBusinessDay;
  isClosed: boolean;
  periods: ShopBusinessPeriod[];
}>;

export type ShopDetailData = ShopBaseData & {
  phone: string | null;
  description: string | null;
  businessHours: ShopBusinessHour[];
  businessHoursNote: string | null;
  instagramUrl: string | null;
  naverPlaceUrl: string | null;

  images: ShopImage[];

  sourceType: ShopSourceType;
  createdAt: string;
  updatedAt: string;
};

/**
 * GET /api/shops 성공 응답
 */
export type GetShopsResponse = ApiSuccessResponse<ShopListData>;

/**
 * GET /api/shops/map 성공 응답
 */
export type GetShopMapResponse = ApiSuccessResponse<ShopMapData>;

/**
 * GET /api/shops/:shopId 성공 응답
 */
export type GetShopDetailResponse = ApiSuccessResponse<ShopDetailData>;

export type LikedShopListItem = ShopListItem & {
  likedAt: string;
};

export type LikedShopListData = {
  items: LikedShopListItem[];
  pagination: Pagination;
};
