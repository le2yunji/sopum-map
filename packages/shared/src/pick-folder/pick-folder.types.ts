import type { Pagination } from "../api/api.types";
import type { ShopCategory, ShopRegionGroup } from "../shop/shop.types";

/**
 * 내 픽 폴더 기본 데이터
 */
export type PickFolder = Readonly<{
  id: string;
  title: string;
  description: string | null;
  order: number;
}>;

/**
 * 내 픽 폴더 목록의 개별 항목
 */
export type PickFolderListItem = PickFolder &
  Readonly<{
    shopCount: number;
    courseId: string | null;
  }>;

/**
 * 내 픽 폴더 목록 데이터
 */
export type PickFolderListData = Readonly<{
  items: PickFolderListItem[];
}>;

/**
 * 특정 상점이 현재 포함된 폴더 ID 목록
 */
export type ShopFolderIdsData = Readonly<{
  folderIds: string[];
}>;

/**
 * 폴더와 상점의 연결 정보
 */
export type PickFolderShopData = Readonly<{
  folderId: string;
  shopId: string;
}>;

/**
 * 특정 폴더에 포함된 상점 목록의 개별 항목
 */
export type PickFolderShopListItem = Readonly<{
  id: string;
  name: string;
  category: ShopCategory;
  address: string;
  isLiked: boolean;
  regionGroup: ShopRegionGroup;
  mainImageUrl: string | null;
}>;

/**
 * 특정 폴더에 포함된 상점 목록 데이터
 */
export type PickFolderShopListData = Readonly<{
  items: PickFolderShopListItem[];
  pagination: Pagination;
}>;
