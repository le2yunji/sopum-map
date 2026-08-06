import { SHOP_CATEGORIES, SHOP_STATUSES } from "../constants/shop.constants";

/**
 * Shop 모델에 저장할 수 있는 카테고리 타입
 */
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export type ShopStatus = (typeof SHOP_STATUSES)[number];

/**
 * 매장 정렬 기준
 *
 * latest: 최신 등록순
 * distance: 현재 위치에서 가까운 순
 * bookmark: 좋아요 수가 많은 순
 */
export type ShopSort = "latest" | "distance" | "bookmark";

export type ShopSourceType =
  | "direct"
  | "official"
  | "user_suggestion"
  | "public_data";

export type ShopImageSourceType =
  | "official"
  | "user"
  | "admin"
  | "public_data"
  | "etc";

/**
 * GET /shops 요청 Query Parameter
 *
 * 실제 URL에서는 문자열로 전달되지만,
 * 컨트롤러에서 숫자와 enum 타입으로 변환한 뒤 사용한다.
 */
export type GetShopsQuery = {
  category?: ShopCategory;
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

/**
 * 매장 태그 요약 정보
 */
export type ShopTag = {
  id: string;
  name: string;
  type?: string;
  usage?: string;
};

/**
 * 매장 목록에 표시할 매장 요약 정보
 */
export type ShopListItem = {
  id: string;
  category: ShopCategory;
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

  /**
   * lat와 lng를 전달했을 때만 포함한다.
   * 단위는 m이다.
   */
  distance?: number;
};

/**
 * 페이지네이션 정보
 */
export type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

/**
 * GET /shops의 data 응답
 */
export type ShopListData = {
  items: ShopListItem[];
  pagination: Pagination;
};

/**
 * 매장 상세 이미지
 */
export type ShopImage = {
  imageUrl: string;
  altText?: string;
  sourceUrl: string | null;
  sourceType: ShopImageSourceType;
  isMain: boolean;
  order: number;
};

/**
 * GET /shops/:shopId의 data 응답
 */
export type ShopDetailData = {
  id: string;
  category: ShopCategory;
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
  createdAt: string;
  updatedAt: string;
};
