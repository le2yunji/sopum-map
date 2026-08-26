// shop.api.types.ts
import type { ApiSuccessResponse, Pagination } from "../api/api.types";
import type { TagKey } from "../tag";
import { SHOP_SORTS } from "./shop.constants";

import type {
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

export type ShopTag = {
  key: TagKey;
  count: number;
};

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
  mainImageUrl: string | null;
  distanceMeters?: number;
};

export type ShopListData = {
  items: ShopListItem[];
  pagination: Pagination;
};

export type ShopDetailData = ShopBaseData & {
  phone: string | null;
  description: string | null;
  openingHours: string | null;
  instagramUrl: string | null;
  naverMapUrl: string | null;
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
