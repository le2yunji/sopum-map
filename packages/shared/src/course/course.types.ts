import type { CourseType } from "./course.constants";
import type { ShopRegionGroup, ShopStatus } from "../shop/shop.types";

/** 코스 상세와 목록에 표시하는 작성자 정보 */
export type CourseAuthor = Readonly<{
  id: string | null;
  displayName: string;
  profileImageUrl: string | null;
  isService: boolean;
}>;

/**
 * 코스에 포함된 상점 정보
 */
export type CourseShop = Readonly<{
  shopId: string;
  order: number;
  memo: string | null;
  walkingDistanceFromPreviousMeters: number | null;
  walkingDurationFromPreviousSeconds: number | null;
}>;

/**
 * 코스 공통 기본 데이터
 */
export type CourseBaseData = Readonly<{
  id: string;

  courseType: CourseType;

  sourceFolderId: string | null;

  title: string;
  description: string | null;

  regionGroup: ShopRegionGroup;

  isPublic: boolean;

  shops: readonly CourseShop[];

  createdAt: string;
  updatedAt: string;
}>;

/**
 * 코스 상세 화면에 표시하는 상점 데이터
 */
export type CourseDetailShop = Readonly<{
  id: string;

  name: string;
  address: string;

  mainImageUrl: string | null;

  regionGroup: ShopRegionGroup;

  latitude: number;
  longitude: number;

  status: ShopStatus;

  /**
   * 코스에서 현재 방문하기 어려운 상점인지 여부
   *
   * temporarily_closed / closed인 경우 true
   * active / hidden인 경우 false
   */
  isUnavailable: boolean;

  order: number;

  memo: string | null;

  walkingDistanceFromPreviousMeters: number | null;
  walkingDurationFromPreviousSeconds: number | null;
}>;

/**
 * 코스 상세 조회 데이터
 */
export type CourseDetailData = Readonly<{
  id: string;

  courseType: CourseType;

  sourceFolderId: string | null;

  title: string;
  description: string | null;

  regionGroup: ShopRegionGroup;

  isPublic: boolean;

  author: CourseAuthor;
  isOwner: boolean;
  likeCount: number;
  isLiked: boolean;

  shops: readonly CourseDetailShop[];

  createdAt: string;
  updatedAt: string;
}>;
