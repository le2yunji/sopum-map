import type {
  ShopDetailData,
  ShopImage,
  ShopListItem,
} from "@sopum-map/shared";

import type {
  ShopListAggregateItem,
  ShopQueryResult,
} from "./shop.query.types";

type MapShopListItemParams = {
  shop: ShopListAggregateItem;
  visitLogCount: number;
  isLiked: boolean;
};

/**
 * 대표 이미지를 찾는다.
 *
 * isMain이 true인 이미지가 없으면
 * 노출 순서가 가장 빠른 이미지를 사용한다.
 */
const getMainImageUrl = (
  images: ShopListAggregateItem["images"],
): string | null => {
  const sortedImages = [...images].sort(
    (first, second) => first.order - second.order,
  );

  const mainImage =
    sortedImages.find((image) => image.isMain) ?? sortedImages[0];

  return mainImage?.imageUrl ?? null;
};

/** 매장 태그 집계를 API 응답 형태로 복사합니다. */
const mapShopTags = (
  tagStats: ShopListAggregateItem["tagStats"],
): ShopListItem["tags"] => {
  return tagStats.map(({ key, count }) => ({ key, count }));
};

const sortShopImages = (
  images: ShopQueryResult["images"],
): ShopQueryResult["images"][number][] => {
  return [...images].sort(
    (first, second) => (first.order ?? 0) - (second.order ?? 0),
  );
};

const mapShopImage = (
  image: NonNullable<ShopQueryResult["images"]>[number],
): ShopImage => {
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
    item.distanceMeters = Math.round(shop.distance);
  }

  return item;
};

/**
 * Shop 문서를 GET /shops/:shopId 상세 응답으로 변환한다.
 */
/**
 * MongoDB Shop → Shop 상세 API 응답
 */
export const mapShopDetail = (shop: ShopQueryResult): ShopDetailData => {
  const [longitude, latitude] = shop.location.coordinates;
  const images = sortShopImages(shop.images ?? []);

  return {
    id: shop._id.toString(),
    category: shop.category,
    tags: shop.tagStats ?? [],
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

    images: images.map(mapShopImage),
    mainImageUrl: images[0]?.imageUrl ?? null,
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
