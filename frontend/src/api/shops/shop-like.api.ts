// frontend/src/api/shops/shop-like.api.ts

import type {
  GetLikedShopsQuery,
  ShopLikeData,
  ShopListData,
} from "@sopum-map/shared";

import { apiClient } from "../client";

export function likeShop(shopId: string): Promise<ShopLikeData> {
  return apiClient<ShopLikeData>(`/shops/${shopId}/likes`, {
    method: "POST",
  });
}

export function unlikeShop(shopId: string): Promise<ShopLikeData> {
  return apiClient<ShopLikeData>(`/shops/${shopId}/likes`, {
    method: "DELETE",
  });
}

export function getLikedShops(
  query: GetLikedShopsQuery = {},
): Promise<ShopListData> {
  const searchParams = new URLSearchParams();

  if (query.page !== undefined) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    searchParams.set("limit", String(query.limit));
  }

  const queryString = searchParams.toString();

  return apiClient<ShopListData>(
    queryString ? `/me/liked-shops?${queryString}` : "/me/liked-shops",
  );
}
