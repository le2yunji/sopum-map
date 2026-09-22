import { Pagination } from "../api/api.types";
import type { ShopCategory, ShopRegionGroup } from "../shop/shop.types";

export type PickFolder = Readonly<{
  id: string;
  title: string;
  description: string | null;
  order: number;
}>;

export type PickFolderListItem = PickFolder &
  Readonly<{
    shopCount: number;
  }>;

export type PickFolderListData = Readonly<{
  items: PickFolderListItem[];
}>;

export type CreatePickFolderRequest = Readonly<{
  title: string;
  description?: string | null;
}>;

export type UpdatePickFolderRequest = Readonly<{
  title?: string;
  description?: string | null;
}>;

export type UpdatePickFolderOrderRequest = Readonly<{
  folderIds: string[];
}>;

/**
 * 특정 상점이 현재 포함된 폴더 목록
 */
export type ShopFolderIdsData = Readonly<{
  folderIds: string[];
}>;

/**
 * 특정 상점의 폴더 구성을 한 번에 변경
 */
export type UpdateShopFolderIdsRequest = Readonly<{
  folderIds: string[];
}>;

/**
 * 특정 폴더에 상점을 추가하는 요청
 */
export type AddShopToFolderRequest = Readonly<{
  shopId: string;
}>;

/**
 * 폴더와 상점의 연결 정보
 */
export type PickFolderShopData = Readonly<{
  folderId: string;
  shopId: string;
}>;

export type PickFolderShopListItem = Readonly<{
  id: string;
  name: string;
  category: ShopCategory;
  address: string;
  isLiked: boolean;
  regionGroup: ShopRegionGroup;
  mainImageUrl: string | null;
}>;

export type PickFolderShopListData = Readonly<{
  items: PickFolderShopListItem[];
  pagination: Pagination;
}>;
