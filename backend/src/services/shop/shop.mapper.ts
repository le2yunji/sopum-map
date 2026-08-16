import type { ShopDetailData, ShopListItem } from "@sopum-map/shared";

import type { ShopDocument } from "./shop.service.types";

type MapShopListItemParams = {
  shop: ShopDocument;
  visitLogCount: number;
  isLiked: boolean;
};

type MapShopDetailParams = {
  shop: ShopDocument;
  visitLogCount: number;
  isLiked: boolean;
};

/**
 * 이미지 노출 순서대로 정렬한다.
 */
const sortShopImages = (
  images: ShopDocument["images"],
): ShopDocument["images"][number][] => {
  return [...images].sort((first, second) => first.order - second.order);
};
/**
 * 대표 이미지를 찾는다.
 *
 * isMain이 true인 이미지가 없으면
 * 노출 순서가 가장 빠른 이미지를 사용한다.
 */
const getMainImageUrl = (images: ShopDocument["images"]): string | null => {
  const sortedImages = sortShopImages(images);

  const mainImage =
    sortedImages.find((image) => image.isMain) ?? sortedImages[0];

  return mainImage?.imageUrl ?? null;
};

/** 매장 태그 집계를 API 응답 형태로 복사합니다. */
const mapShopTags = (tagStats: ShopDocument["tagStats"]): ShopListItem["tags"] => {
  return tagStats.map(({ key, count }) => ({ key, count }));
};

/**
 * Shop 문서를 GET /shops의 개별 목록 항목으로 변환한다.
 */
export const mapShopListItem = ({
  shop,
  visitLogCount,
  isLiked,
}: MapShopListItemParams): ShopListItem => {
  const [longitude, latitude] = shop.location.coordinates;

  const item: ShopListItem = {
    id: shop._id.toString(),
    category: shop.category,
    tags: mapShopTags(shop.tagStats),
    name: shop.name,
    address: shop.address,
    region1: shop.region1,
    region2: shop.region2,
    region3: shop.region3 ?? null,
    latitude,
    longitude,
    mainImageUrl: getMainImageUrl(shop.images),
    status: shop.status,
    likeCount: shop.likeCount,
    visitLogCount,
    isLiked,
  };

  /*
   * $geoNear를 사용한 경우에만 distance가 존재한다.
   */
  if (shop.distance !== undefined) {
    item.distance = Math.round(shop.distance);
  }

  return item;
};

/**
 * Shop 문서를 GET /shops/:shopId 상세 응답으로 변환한다.
 */
export const mapShopDetail = ({
  shop,
  visitLogCount,
  isLiked,
}: MapShopDetailParams): ShopDetailData => {
  const [longitude, latitude] = shop.location.coordinates;

  const images = sortShopImages(shop.images).map((image) => ({
    imageUrl: image.imageUrl,
    altText: image.altText,
    sourceUrl: image.sourceUrl ?? null,
    sourceType: image.sourceType,
    isMain: image.isMain,
    order: image.order,
  }));

  return {
    id: shop._id.toString(),
    category: shop.category,
    tags: mapShopTags(shop.tagStats),
    name: shop.name,
    address: shop.address,
    region1: shop.region1,
    region2: shop.region2,
    region3: shop.region3 ?? null,
    latitude,
    longitude,
    phone: shop.phone ?? null,
    description: shop.description ?? null,
    openingHours: shop.openingHours ?? null,
    instagramUrl: shop.instagramUrl ?? null,
    naverMapUrl: shop.naverMapUrl ?? null,
    images,
    sourceType: shop.sourceType,
    status: shop.status,
    likeCount: shop.likeCount,
    visitLogCount,
    isLiked,
    createdAt: shop.createdAt.toISOString(),
    updatedAt: shop.updatedAt.toISOString(),
  };
};
