// shop.api.types.ts
import type { ApiSuccessResponse, Pagination } from "../api/api.types";
import type { TagKey } from "../tag";

import type {
  ShopCategory,
  ShopImageSourceType,
  ShopSourceType,
  ShopStatus,
} from "./shop.types";

export type ShopSort = "latest" | "distance" | "popular";

export type GetShopsQuery = {
  category?: ShopCategory;
  tagKeys?: TagKey[];
  keyword?: string;
  region1?: string;
  region2?: string;
  region3?: string;
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

export type ShopListItem = {
  id: string;
  category: ShopCategory;
  tags: ShopTag[];
  name: string;
  address: string;
  region1: string;
  region2: string;
  region3: string | null;
  latitude: number;
  longitude: number;
  mainImageUrl: string | null;
  status: ShopStatus;
  likeCount: number;
  visitLogCount: number;
  isLiked: boolean;
  distance?: number;
};

export type ShopListData = {
  items: ShopListItem[];
  pagination: Pagination;
};

/**
 * GET /api/shops 성공 응답
 */
export type GetShopsResponse = ApiSuccessResponse<ShopListData>;

export type ShopDetailData = {
  id: string;
  category: ShopCategory;
  tags: ShopTag[];
  name: string;
  address: string;
  region1: string;
  region2: string;
  region3: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  description: string | null;
  openingHours: string | null;
  instagramUrl: string | null;
  naverMapUrl: string | null;
  images: ShopImage[];
  sourceType: ShopSourceType;
  status: ShopStatus;
  likeCount: number;
  visitLogCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * GET /api/shops/:shopId 성공 응답
 */
export type GetShopDetailResponse = ApiSuccessResponse<ShopDetailData>;
