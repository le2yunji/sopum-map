import fs from "node:fs/promises";
import path from "node:path";

import type { PublicShopCandidate, ShopSeed } from "./public-shop.types";

import { isValidKoreaCoordinate } from "./public-shop.utils";

const INPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/processed/public-shop-candidates.json",
);

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/public/seeds/shops.seed.json",
);

/**
 * 공공데이터 후보를
 * 실제 Shop seed 형태로 변환한다.
 */
function createSeed(candidate: PublicShopCandidate): ShopSeed | null {
  /**
   * REVIEW 데이터는 사람이 확인하기 전에는
   * DB에 넣지 않는다.
   */
  if (candidate.reviewStatus !== "keep") {
    return null;
  }

  const address = candidate.roadAddress ?? candidate.address;

  if (!address) {
    console.warn(`[제외] 주소 없음: ${candidate.name}`);

    return null;
  }

  if (!candidate.region1 || !candidate.region2) {
    console.warn(`[제외] 지역 정보 없음: ${candidate.name}`);

    return null;
  }

  if (!isValidKoreaCoordinate(candidate.longitude, candidate.latitude)) {
    console.warn(`[제외] 좌표 없음: ${candidate.name}`);

    return null;
  }

  return {
    /**
     * 여기부터는 공공데이터 기반 실제 Shop 정보.
     */
    name: candidate.name,

    category: candidate.category,

    tagStats: [],

    address,

    region1: candidate.region1,

    region2: candidate.region2,

    region3: candidate.region3 ?? null,

    location: {
      type: "Point",

      coordinates: [candidate.longitude!, candidate.latitude!],
    },

    phone: null,

    description: null,

    openingHours: null,

    instagramUrl: null,

    /**
     * 네이버 정보는 DB 데이터로 복사하지 않는다.
     */
    naverPlaceId: null,

    naverPlaceUrl: null,

    naverMapUrl: null,

    images: [],

    sourceType: "public_data",

    likeCount: 0,

    status: "active",
  };
}

async function main() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");

  const candidates = JSON.parse(raw) as PublicShopCandidate[];

  const seeds = candidates
    .map(createSeed)
    .filter((seed): seed is ShopSeed => seed !== null);

  await fs.mkdir(path.dirname(OUTPUT_PATH), {
    recursive: true,
  });

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(seeds, null, 2), "utf8");

  console.log("");
  console.log("======================================");

  console.log(`후보: ${candidates.length}개`);

  console.log(`Seed 생성: ${seeds.length}개`);

  console.log(`REVIEW/정보부족 제외: ${candidates.length - seeds.length}개`);

  console.log(`저장 위치: ${OUTPUT_PATH}`);

  console.log("======================================");
}

main().catch((error) => {
  console.error("Shop Seed 생성 중 오류가 발생했습니다.");

  console.error(error);

  process.exitCode = 1;
});
