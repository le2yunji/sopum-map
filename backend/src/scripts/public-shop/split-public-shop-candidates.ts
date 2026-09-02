import fs from "node:fs/promises";
import path from "node:path";

import type { PublicShopCandidate } from "./public-shop.types.js";

/**
 * 전체 후보 파일.
 */
const INPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/processed/public-shop-candidates.json",
);

/**
 * 네이버 검수 + 공공데이터 매칭까지 끝난 후보.
 */
const VERIFIED_OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/processed/public-shop-verified.json",
);

/**
 * 공공데이터 조건만으로 잡혀서
 * 사람이 추가 검수해야 하는 후보.
 */
const NEEDS_REVIEW_OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/processed/public-shop-needs-review.json",
);

/**
 * 네이버 reference로 검증된 후보인지 확인한다.
 */
function isVerifiedCandidate(candidate: PublicShopCandidate): boolean {
  return candidate.selectionReasons.includes("naver_reference");
}

async function main() {
  /**
   * 전체 후보 읽기.
   */
  const raw = await fs.readFile(INPUT_PATH, "utf8");

  const candidates = JSON.parse(raw) as PublicShopCandidate[];

  /**
   * 검증 완료.
   */
  const verified = candidates.filter(isVerifiedCandidate);

  /**
   * 추가 검수 필요.
   */
  const needsReview = candidates.filter(
    (candidate) => !isVerifiedCandidate(candidate),
  );

  /**
   * 보기 편하게 지역 → 이름 순으로 정렬.
   */
  const sortCandidates = (items: PublicShopCandidate[]) => {
    return items.sort((left, right) => {
      const regionCompare = left.regionGroup.localeCompare(
        right.regionGroup,
        "ko",
      );

      if (regionCompare !== 0) {
        return regionCompare;
      }

      return left.name.localeCompare(right.name, "ko");
    });
  };

  sortCandidates(verified);

  sortCandidates(needsReview);

  await fs.mkdir(path.dirname(VERIFIED_OUTPUT_PATH), {
    recursive: true,
  });

  await Promise.all([
    fs.writeFile(
      VERIFIED_OUTPUT_PATH,
      JSON.stringify(verified, null, 2),
      "utf8",
    ),

    fs.writeFile(
      NEEDS_REVIEW_OUTPUT_PATH,
      JSON.stringify(needsReview, null, 2),
      "utf8",
    ),
  ]);

  /**
   * 지역별 개수 계산.
   */
  const countByRegion = (items: PublicShopCandidate[]) => {
    return items.reduce<Record<string, number>>((result, item) => {
      result[item.regionGroup] = (result[item.regionGroup] ?? 0) + 1;

      return result;
    }, {});
  };

  console.log("");
  console.log("======================================");

  console.log(`[전체 후보] ${candidates.length}개`);

  console.log("");
  console.log(`[검증 완료] ${verified.length}개`);

  console.log(countByRegion(verified));

  console.log("");
  console.log(`[추가 검수 필요] ${needsReview.length}개`);

  console.log(countByRegion(needsReview));

  console.log("");
  console.log(`검증 완료: ${VERIFIED_OUTPUT_PATH}`);

  console.log(`추가 검수: ${NEEDS_REVIEW_OUTPUT_PATH}`);

  console.log("======================================");
}

main().catch((error) => {
  console.error("후보 분리 중 오류가 발생했습니다.");

  console.error(error);

  process.exitCode = 1;
});
