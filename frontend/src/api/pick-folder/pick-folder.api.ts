import type {
  AddShopToFolderRequest,
  CreatePickFolderRequest,
  PickFolder,
  PickFolderListData,
  PickFolderShopData,
  PickFolderShopListData,
  ShopFolderIdsData,
  UpdatePickFolderOrderRequest,
  UpdatePickFolderRequest,
  UpdateShopFolderIdsRequest,
} from "@sopum-map/shared";

import { apiClient } from "../client";

type GetShopsByFolderParams = Readonly<{
  folderId: string;
  page: number;
  limit: number;
}>;

/**
 * 내 픽 폴더 목록 조회
 */
export function getPickFolders() {
  return apiClient<PickFolderListData>("/me/pick-folders");
}

/**
 * 새 내 픽 폴더 생성
 */
export function createPickFolder(input: CreatePickFolderRequest) {
  return apiClient<PickFolder>("/me/pick-folders", {
    method: "POST",
    body: input,
  });
}

/**
 * 내 픽 폴더 수정
 */
export function updatePickFolder(
  folderId: string,
  input: UpdatePickFolderRequest,
) {
  return apiClient<PickFolder>(`/me/pick-folders/${folderId}`, {
    method: "PATCH",
    body: input,
  });
}

/**
 * 내 픽 폴더 삭제
 */
export function deletePickFolder(folderId: string) {
  return apiClient<void>(`/me/pick-folders/${folderId}`, {
    method: "DELETE",
  });
}

/**
 * 내 픽 폴더 순서 변경
 */
export function updatePickFolderOrder(input: UpdatePickFolderOrderRequest) {
  return apiClient<void>("/me/pick-folders/order", {
    method: "PATCH",
    body: input,
  });
}

/**
 * 특정 상점이 포함된 내 픽 폴더 ID 목록 조회
 */
export function getFolderIdsByShop(shopId: string) {
  return apiClient<ShopFolderIdsData>(`/me/liked-shops/${shopId}/folders`);
}

/**
 * 특정 상점의 폴더 소속을 한 번에 변경
 */
export function updateFolderIdsByShop(
  shopId: string,
  input: UpdateShopFolderIdsRequest,
) {
  return apiClient<ShopFolderIdsData>(`/me/liked-shops/${shopId}/folders`, {
    method: "PUT",
    body: input,
  });
}

/**
 * 특정 내 픽 폴더의 상점 목록 조회
 */
export function getShopsByFolder({
  folderId,
  page,
  limit,
}: GetShopsByFolderParams) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiClient<PickFolderShopListData>(
    `/me/pick-folders/${folderId}/shops?${searchParams.toString()}`,
  );
}

/**
 * 좋아요한 상점을 특정 내 픽 폴더에 추가
 */
export function addShopToFolder(
  folderId: string,
  input: AddShopToFolderRequest,
) {
  return apiClient<PickFolderShopData>(`/me/pick-folders/${folderId}/shops`, {
    method: "POST",
    body: input,
  });
}

/**
 * 특정 내 픽 폴더에서 상점 제거
 */
export function removeShopFromFolder(folderId: string, shopId: string) {
  return apiClient<void>(`/me/pick-folders/${folderId}/shops/${shopId}`, {
    method: "DELETE",
  });
}
