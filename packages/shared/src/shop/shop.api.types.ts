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

export type GetShopsQuery = {
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
};

export type ShopTag = Readonly<{
  key: TagKey;
  count: number;
  selectionLabel: string;
  shortLabel: string;
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
 * GET /api/shops/:shopId 성공 응답
 */
export type GetShopDetailResponse = ApiSuccessResponse<ShopDetailData>;
