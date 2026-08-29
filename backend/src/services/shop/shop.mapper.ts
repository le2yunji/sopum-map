import type {
  ShopDetailData,
  ShopImage,
  ShopListItem,
} from "@sopum-map/shared";

import type { ShopSchemaType } from "../../models/shop.model";
import { getMainShopImageUrl } from "../../utils/shop-image";

import type {
  ShopListAggregateItem,
  ShopQueryResult,
} from "./shop.query.types";

type MapShopListItemParams = {
  shop: ShopListAggregateItem;
  visitLogCount: number;
  isLiked: boolean;
};

/** 매장 태그 집계를 API 응답 형태로 복사합니다. */
const mapShopTags = (
  tagStats: ShopSchemaType["tagStats"],
): ShopListItem["tags"] => {
  return tagStats.map(({ key, count }) => ({
    key,
    count,
  }));
};

/** 매장 이미지를 노출 순서대로 정렬합니다. */
const sortShopImages = (
  images: ShopQueryResult["images"],
): ShopQueryResult["images"][number][] => {
  return [...images].sort(
    (first, second) => (first.order ?? 0) - (second.order ?? 0),
  );
};

/** MongoDB 이미지 데이터를 API 이미지 데이터로 변환합니다. */
const mapShopImage = (image: ShopQueryResult["images"][number]): ShopImage => {
  return {
    imageUrl: image.imageUrl,
    altText: image.altText ?? "",
    sourceUrl: image.sourceUrl ?? null,
    sourceType: image.sourceType,
    isMain: image.isMain ?? false,
    order: image.order ?? 0,
  };
};

/**
 * Shop 문서를 GET /api/shops의 개별 목록 항목으로 변환한다.
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
    regionGroup: shop.regionGroup,
    latitude,
    longitude,
    mainImageUrl: getMainShopImageUrl(shop.images),
    status: shop.status,
    likeCount: shop.likeCount,
    visitLogCount,
    isLiked,
  };

  /*
   * $geoNear를 사용한 경우에만 distance가 존재한다.
   */
  if (shop.distance !== undefined) {
    item.distanceMeters = Math.round(shop.distance);
  }

  return item;
};

/**
 * Shop 문서를 GET /shops/:shopId 상세 응답으로 변환한다.
 */
export const mapShopDetail = (shop: ShopQueryResult): ShopDetailData => {
  const [longitude, latitude] = shop.location.coordinates;
  const sortedImages = sortShopImages(shop.images);

  return {
    id: shop._id.toString(),
    category: shop.category,
    tags: mapShopTags(shop.tagStats),
    name: shop.name,
    address: shop.address,
    region1: shop.region1,
    region2: shop.region2,
    region3: shop.region3 ?? null,
    regionGroup: shop.regionGroup,
    /**
     * GeoJSON:
     *
     * coordinates[0] = longitude
     * coordinates[1] = latitude
     */
    latitude,
    longitude,
    phone: shop.phone ?? null,
    description: shop.description ?? null,
    openingHours: shop.openingHours ?? null,
    instagramUrl: shop.instagramUrl ?? null,
    naverMapUrl: shop.naverMapUrl ?? null,

    mainImageUrl: getMainShopImageUrl(shop.images),
    images: sortedImages.map(mapShopImage),

    sourceType: shop.sourceType,
    status: shop.status,
    likeCount: shop.likeCount ?? 0,

    /**
     * VisitLog / Like 사용자 기능 연결 전 임시값.
     *
     * 이후 Service에서 조회해서 Mapper에 전달하는 구조로
     * 바꾸는 것이 좋다.
     */
    visitLogCount: 0,
    isLiked: false,
    createdAt: shop.createdAt.toISOString(),

    updatedAt: shop.updatedAt.toISOString(),
  };
};
