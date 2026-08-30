import { ShopListData, GetShopsQuery, ShopDetailData } from "@sopum-map/shared";
import { apiClient } from "../client";

/** 상점 조회 조건을 URL query string으로 변환합니다. */
export function createShopsSearchParams(query: GetShopsQuery): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (query.category) {
    searchParams.set("category", query.category);
  }

  query.tagKeys?.forEach((tagKey) => {
    searchParams.append("tagKeys", tagKey);
  });

  if (query.keyword) {
    searchParams.set("keyword", query.keyword);
  }

  if (query.regionGroup) {
    searchParams.set("regionGroup", query.regionGroup);
  }

  if (query.lat !== undefined) {
    searchParams.set("lat", String(query.lat));
  }

  if (query.lng !== undefined) {
    searchParams.set("lng", String(query.lng));
  }

  if (query.radius !== undefined) {
    searchParams.set("radius", String(query.radius));
  }

  if (query.page !== undefined) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    searchParams.set("limit", String(query.limit));
  }

  if (query.sort) {
    searchParams.set("sort", query.sort);
  }

  return searchParams;
}

/** 상점 목록을 조회합니다. */
export async function getShops(
  query: GetShopsQuery = {},
): Promise<ShopListData> {
  const searchParams = createShopsSearchParams(query);

  const queryString = searchParams.toString();

  return apiClient<ShopListData>(
    `/shops${queryString ? `?${queryString}` : ""}`,
  );
}

/** 상점 상세 정보를 조회합니다. */
export async function getShopDetail(shopId: string): Promise<ShopDetailData> {
  return apiClient<ShopDetailData>(`/shops/${shopId}`);
}
