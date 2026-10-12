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
 * 코스용 항목
 */
export type PickFolderCourse = Readonly<{
  courseId: string;
  regionGroup: ShopRegionGroup;
}>;

/**
 * 내 픽 폴더 목록의 개별 항목
 */
export type PickFolderListItem = PickFolder &
  Readonly<{
    shopCount: number;
    courses: readonly PickFolderCourse[];
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

export type PickFolderCourseRegion = Readonly<{
  regionGroup: ShopRegionGroup;

  /**
   * 해당 지역에 폴더가 가지고 있는 전체 상점 수
   */
  shopCount: number;

  /**
   * 새 코스에 추가할 수 있는 상점 수
   *
   * active / temporarily_closed만 포함하며
   * 위치 정보가 있는 상점만 계산합니다.
   */
  availableShopCount: number;

  /**
   * 생성 가능한 상점 중 임시 휴무 상태인 상점 수
   */
  temporarilyClosedShopCount: number;

  /**
   * 해당 폴더 + 지역에 이미 만들어진 코스
   */
  courseId: string | null;
}>;

export type PickFolderCourseRegionsData = Readonly<{
  items: readonly PickFolderCourseRegion[];
}>;
