import fs from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";

import {
  DECORATION_MIDDLE_CATEGORY,
  DECORATION_SMALL_CATEGORY_KEYWORDS,
  GACHA_NAME_KEYWORD,
  NAVER_MAX_MATCH_DISTANCE_METERS,
  NAVER_MIN_PARTIAL_NAME_LENGTH,
  NAVER_PARTIAL_NAME_THRESHOLD,
  NAVER_REFERENCE_STATUS,
  REQUIRED_LARGE_CATEGORY,
  SOPUM_NAME_KEYWORD,
} from "./public-shop.config";

import type {
  MatchedNaverReference,
  NaverMatchType,
  NaverReferenceMatch,
  NaverShopReference,
  PublicShopCandidate,
  PublicShopSelectionReason,
  UnmatchedNaverReference,
} from "./public-shop.types";

import {
  calculateDistanceMeters,
  calculateNameSimilarity,
  findRegionGroup,
  isValidKoreaCoordinate,
  normalizeOptionalString,
  normalizeShopName,
  parseOptionalNumber,
} from "./public-shop.utils";

const PUBLIC_RAW_PATH = path.resolve(
  process.cwd(),
  "data/public/raw/shops.csv",
);

const NAVER_REFERENCE_PATH = path.resolve(
  process.cwd(),
  "data/naver/naver-shop-candidates.json",
);

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/processed/public-shop-candidates.json",
);

const NAVER_MATCHED_OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/processed/naver-reference-matched.json",
);

const NAVER_NOT_MATCHED_OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/processed/naver-reference-not-matched.json",
);

const SOURCE_DATASET = "소상공인시장진흥공단 상가업소정보";

const COLUMN = {
  id: "상가업소번호",

  name: "상호명",

  categoryLarge: "상권업종대분류명",

  categoryMiddle: "상권업종중분류명",

  categorySmall: "상권업종소분류명",

  address: "지번주소",

  roadAddress: "도로명주소",

  region1: "시도명",

  region2: "시군구명",

  region3: "법정동명",

  longitude: "경도",

  latitude: "위도",
} as const;

type RawPublicRow = Record<string, string>;

type ParsedPublicRow = {
  sourceId: string;

  name: string;

  categoryLarge?: string;

  categoryMiddle?: string;

  categorySmall?: string;

  address?: string;

  roadAddress?: string;

  region1?: string;

  region2?: string;

  region3?: string;

  regionGroup: ReturnType<typeof findRegionGroup> extends infer T
    ? Exclude<T, undefined>
    : never;

  longitude?: number;

  latitude?: number;
};

type IndexedNaverReference = {
  referenceIndex: number;

  reference: NaverShopReference;
};

type NaverPublicMatchCandidate = {
  referenceIndex: number;

  reference: NaverShopReference;

  publicShop: ParsedPublicRow;

  type: NaverMatchType;

  nameSimilarity: number;

  distanceMeters?: number;

  score: number;

  confidence: "high" | "medium";
};

function getValue(row: RawPublicRow, column: string): string | undefined {
  return normalizeOptionalString(row[column]);
}

function parsePublicRow(row: RawPublicRow): ParsedPublicRow | null {
  const sourceId = getValue(row, COLUMN.id);

  const name = getValue(row, COLUMN.name);

  const region3 = getValue(row, COLUMN.region3);

  const regionGroup = findRegionGroup(region3);

  /**
   * 필수 값 또는 대상 지역이 아니면
   * 처음부터 버린다.
   */
  if (!sourceId || !name || !regionGroup) {
    return null;
  }

  let longitude = parseOptionalNumber(getValue(row, COLUMN.longitude));

  let latitude = parseOptionalNumber(getValue(row, COLUMN.latitude));

  if (!isValidKoreaCoordinate(longitude, latitude)) {
    longitude = undefined;

    latitude = undefined;
  }

  return {
    sourceId,

    name,

    categoryLarge: getValue(row, COLUMN.categoryLarge),

    categoryMiddle: getValue(row, COLUMN.categoryMiddle),

    categorySmall: getValue(row, COLUMN.categorySmall),

    address: getValue(row, COLUMN.address),

    roadAddress: getValue(row, COLUMN.roadAddress),

    region1: getValue(row, COLUMN.region1),

    region2: getValue(row, COLUMN.region2),

    region3,

    regionGroup,

    longitude,

    latitude,
  };
}

/**
 * ============================================================
 * 공공데이터 자체 선별
 * ============================================================
 */

function hasSopumName(name: string): boolean {
  return name.includes(SOPUM_NAME_KEYWORD);
}

function hasGachaName(name: string): boolean {
  return name.includes(GACHA_NAME_KEYWORD);
}

/**
 * 자동 소품샵 업종 후보.
 *
 * 기존:
 *
 * 장식품 소매 > 예술품 소매업
 *
 * 까지 모두 가져와 갤러리가 대량 포함됐다.
 *
 * 이번에는 기념품 계열만 자동 포함한다.
 */
function isDecorationRetailCandidate(shop: ParsedPublicRow): boolean {
  if (shop.categoryLarge !== REQUIRED_LARGE_CATEGORY) {
    return false;
  }

  if (!shop.categoryMiddle?.includes(DECORATION_MIDDLE_CATEGORY)) {
    return false;
  }

  if (!shop.categorySmall) {
    return false;
  }

  return DECORATION_SMALL_CATEGORY_KEYWORDS.some((keyword) =>
    shop.categorySmall!.includes(keyword),
  );
}

/**
 * ============================================================
 * 네이버 reference ↔ 공공데이터
 * ============================================================
 */

/**
 * 두 매장의 좌표를 비교한다.
 */
function getDistance(
  reference: NaverShopReference,

  shop: ParsedPublicRow,
): number | undefined {
  if (
    reference.longitude === undefined ||
    reference.latitude === undefined ||
    shop.longitude === undefined ||
    shop.latitude === undefined
  ) {
    return undefined;
  }

  return calculateDistanceMeters(
    reference.longitude,
    reference.latitude,
    shop.longitude,
    shop.latitude,
  );
}

/**
 * 네이버 reference와 공공데이터 한 행의
 * 매칭 가능성을 계산한다.
 */
function createMatchCandidate(
  indexed: IndexedNaverReference,

  shop: ParsedPublicRow,
): NaverPublicMatchCandidate | null {
  const { referenceIndex, reference } = indexed;

  /**
   * 지역 그룹이 다르면 비교하지 않는다.
   */
  if (reference.regionGroup && reference.regionGroup !== shop.regionGroup) {
    return null;
  }

  const referenceName = normalizeShopName(reference.name);

  const publicName = normalizeShopName(shop.name);

  if (!referenceName || !publicName) {
    return null;
  }

  const distanceMeters = getDistance(reference, shop);

  let type: NaverMatchType;

  let nameSimilarity: number;

  /**
   * ----------------------------------------------------------
   * 정확한 문자열 일치
   * ----------------------------------------------------------
   */
  if (reference.name.trim() === shop.name.trim()) {
    type = "exact";

    nameSimilarity = 1;
  } else if (referenceName === publicName) {

  /**
   * ----------------------------------------------------------
   * 공백/기호 제거 후 일치
   * ----------------------------------------------------------
   */
    type = "normalized";

    nameSimilarity = 1;
  } else {

  /**
   * ----------------------------------------------------------
   * 부분 이름 매칭
   * ----------------------------------------------------------
   */
    const shorterLength = Math.min(referenceName.length, publicName.length);

    /**
     * "메이" 같은 짧은 이름이
     * "메이크폴리오"에 붙는 문제 방지.
     */
    if (shorterLength < NAVER_MIN_PARTIAL_NAME_LENGTH) {
      return null;
    }

    nameSimilarity = calculateNameSimilarity(reference.name, shop.name);

    /**
     * 단순 Levenshtein 점수 외에도
     * 핵심 상호가 한쪽 이름 안에 포함되는 경우를 허용한다.
     *
     * 예:
     *
     * 메릴러번 Marylebone ↔ 메릴러번
     * 제로스페이스 망원 ↔ 제로스페이스
     * 소품샵 오브뉴 ↔ 오브뉴
     */
    const containsCoreName =
      referenceName.includes(publicName) || publicName.includes(referenceName);

    if (!containsCoreName && nameSimilarity < NAVER_PARTIAL_NAME_THRESHOLD) {
      return null;
    }

    /**
     * 부분일치는 좌표 검증이 반드시 필요하다.
     *
     * 좌표 없이는 억지 매칭하지 않는다.
     */
    if (distanceMeters === undefined) {
      return null;
    }

    if (distanceMeters > NAVER_MAX_MATCH_DISTANCE_METERS) {
      return null;
    }

    /**
     * 포함 관계라면 문자 거리만으로 지나치게
     * 낮게 평가하지 않도록 보정한다.
     */
    if (containsCoreName) {
      const lengthRatio =
        shorterLength / Math.max(referenceName.length, publicName.length);

      nameSimilarity = Math.max(nameSimilarity, 0.8 + lengthRatio * 0.2);
    }

    type = "partial";
  }

  /**
   * exact라고 해도 동일 상호의 다른 지점이 있을 수 있으므로
   * 좌표가 있으면 위치를 반드시 점수에 반영한다.
   */
  if (
    distanceMeters !== undefined &&
    distanceMeters > NAVER_MAX_MATCH_DISTANCE_METERS
  ) {
    return null;
  }

  /**
   * 거리 점수.
   *
   * 0m = 1
   * 150m = 0
   */
  const distanceScore =
    distanceMeters === undefined
      ? 0.5
      : Math.max(0, 1 - distanceMeters / NAVER_MAX_MATCH_DISTANCE_METERS);

  /**
   * 이름 60%
   * 위치 40%
   *
   * 이렇게 하면:
   *
   * 같은 이름인데 멀리 있는 지점보다
   * 이름이 조금 다르더라도 바로 옆에 있는 실제 매장이
   * 더 높은 점수를 받을 수 있다.
   */
  const score = nameSimilarity * 0.6 + distanceScore * 0.4;

  return {
    referenceIndex,

    reference,

    publicShop: shop,

    type,

    nameSimilarity: Number(nameSimilarity.toFixed(3)),

    distanceMeters:
      distanceMeters === undefined ? undefined : Math.round(distanceMeters),

    score: Number(score.toFixed(3)),

    confidence: distanceMeters !== undefined ? "high" : "medium",
  };
}

/**
 * 네이버 reference 하나당
 * 공공데이터 최적 후보 하나만 선택한다.
 */
function findBestPublicMatch(
  indexed: IndexedNaverReference,

  publicShops: ParsedPublicRow[],
): NaverPublicMatchCandidate | undefined {
  const candidates = publicShops
    .map((shop) => createMatchCandidate(indexed, shop))
    .filter((match): match is NaverPublicMatchCandidate => match !== null);

  if (candidates.length === 0) {
    return undefined;
  }

  candidates.sort((left, right) => {
    /**
     * 1순위: 최종 종합 점수.
     */
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    /**
     * 2순위: 가까운 거리.
     */
    return (
      (left.distanceMeters ?? Infinity) - (right.distanceMeters ?? Infinity)
    );
  });

  return candidates[0];
}

/**
 * 공공데이터 후보에
 * 네이버 reference 매칭 정보를 병합한다.
 */
function createNaverMatchMetadata(
  match: NaverPublicMatchCandidate,
): NaverReferenceMatch {
  return {
    referenceIndex: match.referenceIndex,

    referenceName: match.reference.name,

    type: match.type,

    nameSimilarity: match.nameSimilarity,

    distanceMeters: match.distanceMeters,

    score: match.score,

    confidence: match.confidence,
  };
}

function determineCategory(shop: ParsedPublicRow): "소품샵" | "가챠샵" {
  return hasGachaName(shop.name) ? "가챠샵" : "소품샵";
}

function createBaseCandidate(
  shop: ParsedPublicRow,

  reasons: PublicShopSelectionReason[],
): PublicShopCandidate {
  return {
    sourceId: shop.sourceId,

    sourceDataset: SOURCE_DATASET,

    name: shop.name,

    category: determineCategory(shop),

    originalCategoryLarge: shop.categoryLarge,

    originalCategoryMiddle: shop.categoryMiddle,

    originalCategorySmall: shop.categorySmall,

    address: shop.address,

    roadAddress: shop.roadAddress,

    region1: shop.region1,

    region2: shop.region2,

    region3: shop.region3,

    regionGroup: shop.regionGroup,

    longitude: shop.longitude,

    latitude: shop.latitude,

    selectionReasons: reasons,

    reviewStatus: "keep",
  };
}

async function main() {
  /**
   * ==========================================================
   * 1. 공공데이터 읽기
   * ==========================================================
   */
  const publicRaw = await fs.readFile(PUBLIC_RAW_PATH, "utf8");

  const rawRows = parse(publicRaw, {
    columns: true,

    skip_empty_lines: true,

    relax_column_count: true,

    bom: true,

    trim: true,
  }) as RawPublicRow[];

  /**
   * 대상 지역에 해당하는 공공데이터만 유지.
   */
  const publicShops = rawRows
    .map(parsePublicRow)
    .filter((shop): shop is ParsedPublicRow => shop !== null);

  /**
   * ==========================================================
   * 2. 네이버 reference 읽기
   * ==========================================================
   */
  const naverRaw = await fs.readFile(NAVER_REFERENCE_PATH, "utf8");

  const rawReferences = JSON.parse(naverRaw) as NaverShopReference[];

  const references: IndexedNaverReference[] = rawReferences
    .map((reference, referenceIndex) => ({
      referenceIndex,
      reference,
    }))
    .filter(
      ({ reference }) => reference.reviewStatus === NAVER_REFERENCE_STATUS,
    );

  /**
   * ==========================================================
   * 3. 공공데이터 자체 조건 선별
   * ==========================================================
   */
  const candidateMap = new Map<string, PublicShopCandidate>();

  let sopumNameCount = 0;

  let gachaNameCount = 0;

  let decorationCount = 0;

  for (const shop of publicShops) {
    const reasons: PublicShopSelectionReason[] = [];

    if (hasSopumName(shop.name)) {
      reasons.push("name_sopum");

      sopumNameCount += 1;
    }

    if (hasGachaName(shop.name)) {
      reasons.push("name_gacha");

      gachaNameCount += 1;
    }

    if (isDecorationRetailCandidate(shop)) {
      reasons.push("retail_decoration_category");

      decorationCount += 1;
    }

    if (reasons.length === 0) {
      continue;
    }

    candidateMap.set(shop.sourceId, createBaseCandidate(shop, reasons));
  }

  /**
   * ==========================================================
   * 4. 네이버 KEEP 매장을 하나씩 공공데이터에 매칭
   * ==========================================================
   *
   * 핵심:
   *
   * 네이버 하나
   * → 전체 공공데이터 후보 비교
   * → 최적 1개만 채택
   */
  const matchedReports: MatchedNaverReference[] = [];

  const unmatchedReports: UnmatchedNaverReference[] = [];

  for (const indexed of references) {
    const bestMatch = findBestPublicMatch(indexed, publicShops);

    if (!bestMatch) {
      unmatchedReports.push({
        referenceIndex: indexed.referenceIndex,

        name: indexed.reference.name,

        regionGroup: indexed.reference.regionGroup,

        referenceAddress: indexed.reference.address,

        referenceRoadAddress: indexed.reference.roadAddress,
      });

      continue;
    }

    const shop = bestMatch.publicShop;

    const metadata = createNaverMatchMetadata(bestMatch);

    /**
     * 이미 조건 1~3으로 후보에 있다면
     * naver_reference 이유만 추가한다.
     */
    const existing = candidateMap.get(shop.sourceId);

    if (existing) {
      if (!existing.selectionReasons.includes("naver_reference")) {
        existing.selectionReasons.push("naver_reference");
      }

      existing.naverReferenceMatch = metadata;
    } else {
      const candidate = createBaseCandidate(shop, ["naver_reference"]);

      candidate.naverReferenceMatch = metadata;

      candidateMap.set(shop.sourceId, candidate);
    }

    matchedReports.push({
      referenceIndex: indexed.referenceIndex,

      referenceName: indexed.reference.name,

      regionGroup: indexed.reference.regionGroup,

      match: {
        type: bestMatch.type,

        nameSimilarity: bestMatch.nameSimilarity,

        distanceMeters: bestMatch.distanceMeters,

        score: bestMatch.score,

        confidence: bestMatch.confidence,
      },

      publicData: {
        sourceId: shop.sourceId,

        name: shop.name,

        address: shop.address,

        roadAddress: shop.roadAddress,

        region1: shop.region1,

        region2: shop.region2,

        region3: shop.region3,

        longitude: shop.longitude,

        latitude: shop.latitude,

        originalCategoryLarge: shop.categoryLarge,

        originalCategoryMiddle: shop.categoryMiddle,

        originalCategorySmall: shop.categorySmall,
      },
    });
  }

  /**
   * ==========================================================
   * 5. 최종 후보
   * ==========================================================
   */
  const candidates = [...candidateMap.values()];

  candidates.sort((left, right) => {
    const region = left.regionGroup.localeCompare(right.regionGroup, "ko");

    if (region !== 0) {
      return region;
    }

    return left.name.localeCompare(right.name, "ko");
  });

  matchedReports.sort((left, right) =>
    left.referenceName.localeCompare(right.referenceName, "ko"),
  );

  unmatchedReports.sort((left, right) =>
    left.name.localeCompare(right.name, "ko"),
  );

  await fs.mkdir(path.dirname(OUTPUT_PATH), {
    recursive: true,
  });

  await Promise.all([
    fs.writeFile(
      OUTPUT_PATH,

      JSON.stringify(candidates, null, 2),

      "utf8",
    ),

    fs.writeFile(
      NAVER_MATCHED_OUTPUT_PATH,

      JSON.stringify(matchedReports, null, 2),

      "utf8",
    ),

    fs.writeFile(
      NAVER_NOT_MATCHED_OUTPUT_PATH,

      JSON.stringify(unmatchedReports, null, 2),

      "utf8",
    ),
  ]);

  /**
   * ==========================================================
   * 6. 결과 통계
   * ==========================================================
   */
  const exactCount = matchedReports.filter(
    ({ match }) => match.type === "exact",
  ).length;

  const normalizedCount = matchedReports.filter(
    ({ match }) => match.type === "normalized",
  ).length;

  const partialCount = matchedReports.filter(
    ({ match }) => match.type === "partial",
  ).length;

  const matchRate =
    references.length === 0
      ? 0
      : (matchedReports.length / references.length) * 100;

  console.log("");
  console.log("======================================");

  console.log(`공공데이터 전체: ${rawRows.length}개`);

  console.log(`대상 지역: ${publicShops.length}개`);

  console.log("");
  console.log("[공공데이터 자체 선별]");

  console.log(`이름 "소품샵": ${sopumNameCount}개`);

  console.log(`이름 "가챠": ${gachaNameCount}개`);

  console.log(`장식품 소매 > 기념품 계열: ${decorationCount}개`);

  console.log("");
  console.log("[네이버 KEEP 재탐색]");

  console.log(`기준 매장: ${references.length}개`);

  console.log(`매칭 성공: ${matchedReports.length}개`);

  console.log(`  exact: ${exactCount}개`);

  console.log(`  normalized: ${normalizedCount}개`);

  console.log(`  partial: ${partialCount}개`);

  console.log(`매칭 실패: ${unmatchedReports.length}개`);

  console.log(`매칭률: ${matchRate.toFixed(1)}%`);

  console.log("");
  console.log(`최종 공공데이터 후보: ${candidates.length}개`);

  console.log("======================================");
}

main().catch((error) => {
  console.error("공공데이터 수집 중 오류가 발생했습니다.");

  console.error(error);

  process.exitCode = 1;
});
