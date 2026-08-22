export const PUBLIC_SHOP_REGIONS = {
  "성수/서울숲": ["성수동1가", "성수동2가"],

  "홍대/연남": ["동교동", "서교동", "연남동"],

  망원: ["망원동"],

  서촌: [
    "통인동",
    "누하동",
    "누상동",
    "체부동",
    "옥인동",
    "필운동",
    "통의동",
    "창성동",
    "효자동",
    "내자동",
  ],
} as const;

export type PublicShopRegionGroup = keyof typeof PUBLIC_SHOP_REGIONS;

/**
 * 이름 기반 직접 선별.
 */
export const SOPUM_NAME_KEYWORD = "소품샵";

export const GACHA_NAME_KEYWORD = "가챠";

/**
 * 공공데이터 업종 기반 선별.
 */
export const REQUIRED_LARGE_CATEGORY = "소매";

export const DECORATION_MIDDLE_CATEGORY = "장식품 소매";

/**
 * 기념품점은 소품샵 후보로 자동 포함.
 *
 * 예술품 소매업은 갤러리 노이즈가 너무 많아서
 * 자동 포함하지 않는다.
 */
export const DECORATION_SMALL_CATEGORY_KEYWORDS = [
  "기념품점",
  "기념품",
  "관광 민예품",
  "관광민예품",
] as const;

/**
 * 네이버에서 이미 소품샵으로 검수한 데이터만
 * 공공데이터 재탐색에 사용.
 */
export const NAVER_REFERENCE_STATUS = "keep";

/**
 * 부분 이름 매칭 최소 유사도.
 *
 * 이전 0.8보다 보수적으로 상향.
 */
export const NAVER_PARTIAL_NAME_THRESHOLD = 0.85;

/**
 * 부분 이름 매칭 시
 * 짧은 상호명이 억지로 붙는 문제 방지.
 *
 * 예:
 *
 * 메이크폴리오 → 메이
 *
 * 는 2글자라서 탈락.
 */
export const NAVER_MIN_PARTIAL_NAME_LENGTH = 4;

/**
 * 네이버와 공공데이터 좌표 간
 * 최대 허용 거리.
 *
 * 부분 매칭은 위치까지 가까워야 인정한다.
 */
export const NAVER_MAX_MATCH_DISTANCE_METERS = 150;
