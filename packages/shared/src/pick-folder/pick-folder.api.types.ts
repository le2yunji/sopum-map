import type { ApiSuccessResponse } from "../api/api.types";

import type {
  PickFolder,
  PickFolderListData,
  PickFolderShopData,
  PickFolderShopListData,
  ShopFolderIdsData,
} from "./pick-folder.types";

/**
 * POST /api/me/pick-folders 요청 데이터
 */
export type CreatePickFolderRequest = Readonly<{
  title: string;
  description?: string | null;
}>;

/**
 * PATCH /api/me/pick-folders/:folderId 요청 데이터
 */
export type UpdatePickFolderRequest = Readonly<{
  title?: string;
  description?: string | null;
}>;

/**
 * PATCH /api/me/pick-folders/order 요청 데이터
 */
export type UpdatePickFolderOrderRequest = Readonly<{
  folderIds: string[];
}>;

/**
 * PUT /api/me/liked-shops/:shopId/folders 요청 데이터
 */
export type UpdateShopFolderIdsRequest = Readonly<{
  folderIds: string[];
}>;

/**
 * POST /api/me/pick-folders/:folderId/shops 요청 데이터
 */
export type AddShopToFolderRequest = Readonly<{
  shopId: string;
}>;

/**
 * GET /api/me/pick-folders 성공 응답
 */
export type GetMyPickFoldersResponse = ApiSuccessResponse<PickFolderListData>;

/**
 * POST /api/me/pick-folders 성공 응답
 */
export type CreatePickFolderResponse = ApiSuccessResponse<PickFolder>;

/**
 * PATCH /api/me/pick-folders/:folderId 성공 응답
 */
export type UpdatePickFolderResponse = ApiSuccessResponse<PickFolder>;

/**
 * GET /api/me/liked-shops/:shopId/folders 성공 응답
 */
export type GetShopPickFoldersResponse = ApiSuccessResponse<ShopFolderIdsData>;

/**
 * PUT /api/me/liked-shops/:shopId/folders 성공 응답
 */
export type UpdateShopFolderIdsResponse = ApiSuccessResponse<ShopFolderIdsData>;

/**
 * POST /api/me/pick-folders/:folderId/shops 성공 응답
 */
export type AddShopToFolderResponse = ApiSuccessResponse<PickFolderShopData>;

/**
 * GET /api/me/pick-folders/:folderId/shops 성공 응답
 */
export type GetPickFolderShopsResponse =
  ApiSuccessResponse<PickFolderShopListData>;
