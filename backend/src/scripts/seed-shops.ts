// backend/src/scripts/seed-shops.ts

import fs from "node:fs/promises";
import path from "node:path";

import mongoose from "mongoose";

import { env } from "../config/env";
import ShopModel from "../models/shop.model";

type FinalShop = {
  sourceId: string;
  name: string;
  category: "소품샵" | "가챠샵";

  address: string;
  roadAddress: string;

  region1: string;
  region2: string;
  region3: string;

  longitude: number;
  latitude: number;
};

const SHOPS_PATH = path.resolve(
  process.cwd(),
  "data/public/final/shops.final.json",
);

// 공공데이터 한 행을 Shop 컬렉션에 저장할 형태로 바꾼다.
function toShopDocument(shop: FinalShop) {
  return {
    publicSourceId: shop.sourceId,
    name: shop.name,
    category: shop.category,

    // 서비스에서는 도로명 주소를 우선 사용한다.
    address: shop.roadAddress || shop.address,

    region1: shop.region1,
    region2: shop.region2,
    region3: shop.region3 || null,

    location: {
      type: "Point" as const,

      // GeoJSON은 [경도, 위도] 순서다.
      coordinates: [shop.longitude, shop.latitude],
    },
  };
}

// 확정 상점 데이터를 기존 운영 데이터는 보존하면서 반복 실행 가능하게 저장한다.
async function seedShops() {
  const raw = await fs.readFile(SHOPS_PATH, "utf8");
  const shops = JSON.parse(raw) as FinalShop[];

  if (shops.length !== 42) {
    throw new Error(
      `확정 매장 수가 예상과 다릅니다. expected=42, actual=${shops.length}`,
    );
  }

  console.log(`확정 매장 ${shops.length}개를 불러왔습니다.`);

  await mongoose.connect(env.mongodbUri);

  console.log("MongoDB 연결 완료");

  /**
   * ShopModel.bulkWrite가 요구하는 타입을 그대로 가져온다.
   *
   * 별도의 복잡한 Mongoose/MongoDB 타입을 직접 선언하지 않아도 되고,
   * operations가 일반 객체 배열로 넓게 추론되는 문제도 방지한다.
   */
  const operations: Parameters<typeof ShopModel.bulkWrite>[0] = shops.map(
    (shop) => {
      const document = toShopDocument(shop);

      return {
        updateOne: {
          filter: {
            $or: [
              { publicSourceId: document.publicSourceId },
              { name: document.name, address: document.address },
            ],
          },

          update: {
            /**
             * 공공데이터에서 실제 확보한 정보만 갱신한다.
             */
            $set: {
              publicSourceId: document.publicSourceId,
              name: document.name,
              category: document.category,
              address: document.address,
              region1: document.region1,
              region2: document.region2,
              region3: document.region3,
              location: document.location,
            },

            /**
             * 아래 값들은 최초 생성 때만 설정한다.
             *
             * 나중에 관리자가 사진, SNS, 영업시간 등을 등록한 뒤
             * seed를 다시 실행해도 해당 데이터를 초기화하지 않는다.
             */
            $setOnInsert: {
              tagStats: [],
              images: [],
              sourceType: "public_data",
              likeCount: 0,
              status: "active",
            },
          },

          upsert: true,
        },
      };
    },
  );

  const result = await ShopModel.bulkWrite(operations);

  console.log("");
  console.log("==============================");
  console.log(`전체 대상: ${shops.length}개`);
  console.log(`새로 추가: ${result.upsertedCount}개`);
  console.log(`기존 데이터 수정: ${result.modifiedCount}개`);
  console.log(`기존 데이터 일치: ${result.matchedCount}개`);
  console.log("==============================");

  await mongoose.disconnect();
}

seedShops().catch(async (error) => {
  console.error("매장 seed 중 오류가 발생했습니다.", error);

  await mongoose.disconnect();

  process.exitCode = 1;
});
