import type { ShopBusinessHour, ShopCategory } from "@sopum-map/shared";
import type { PublicShopRegionGroup } from "./public-shop.config.js";

export type PublicShopSelectionReason =
  | "name_sopum"
  | "name_gacha"
  | "retail_decoration_category"
  | "naver_reference";

export type NaverMatchType = "exact" | "normalized" | "partial";

export type NaverReferenceMatch = {
  referenceIndex: number;

  referenceName: string;

  type: NaverMatchType;

  nameSimilarity: number;

  distanceMeters?: number;

  /**
   * 이름 + 거리 등을 종합한 최종 매칭 점수.
   *
   * 0 ~ 1
   */
  score: number;

  confidence: "high" | "medium";
};

export type PublicShopCandidate = {
  sourceId: string;

  sourceDataset: string;

  name: string;

  category: ShopCategory;

  originalCategoryLarge?: string;

  originalCategoryMiddle?: string;

  originalCategorySmall?: string;

  address?: string;

  roadAddress?: string;

  region1?: string;

  region2?: string;

  region3?: string;

  regionGroup: PublicShopRegionGroup;

  longitude?: number;

  latitude?: number;

  selectionReasons: PublicShopSelectionReason[];

  naverReferenceMatch?: NaverReferenceMatch;

  reviewStatus: "keep" | "review";
};

export type NaverShopReference = {
  name: string;

  address?: string;

  roadAddress?: string;

  longitude?: number;

  latitude?: number;

  regionGroup?: string;

  reviewStatus?: "keep" | "review";
};

export type MatchedNaverReference = {
  referenceIndex: number;

  referenceName: string;

  regionGroup?: string;

  match: {
    type: NaverMatchType;

    nameSimilarity: number;

    distanceMeters?: number;

    score: number;

    confidence: "high" | "medium";
  };

  publicData: {
    sourceId: string;

    name: string;

    address?: string;

    roadAddress?: string;

    region1?: string;

    region2?: string;

    region3?: string;

    longitude?: number;

    latitude?: number;

    originalCategoryLarge?: string;

    originalCategoryMiddle?: string;

    originalCategorySmall?: string;
  };
};

export type UnmatchedNaverReference = {
  referenceIndex: number;

  name: string;

  regionGroup?: string;

  referenceAddress?: string;

  referenceRoadAddress?: string;
};

export type ShopSeed = {
  name: string;

  category: ShopCategory;

  tagStats: [];

  address: string;

  region1: string;

  region2: string;

  region3: string | null;

  location: {
    type: "Point";

    coordinates: [number, number];
  };

  phone: null;

  description: null;

  businessHours: ShopBusinessHour[];
  businessHoursNote: string | null;

  instagramUrl: null;

  naverPlaceUrl: null;

  images: [];

  sourceType: "public_data";

  likeCount: 0;

  status: "active";
};
