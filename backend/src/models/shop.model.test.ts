import { describe, expect, it } from "vitest";

import ShopModel from "./shop.model.js";

/** 모델 검증에 필요한 최소 상점 문서를 생성합니다. */
const createShop = () => {
  return new ShopModel({
    name: "초록 서랍",
    category: "소품샵",
    address: "서울특별시 마포구 연남동 1",
    region1: "서울특별시",
    region2: "마포구",
    regionGroup: "hongdae-yeonnam",
    location: {
      type: "Point",
      coordinates: [126.92, 37.56],
    },
    images: [
      {
        imageUrl: "https://example.com/first.webp",
        isMain: true,
        order: 1,
      },
      {
        imageUrl: "https://example.com/second.webp",
        isMain: true,
        order: 2,
      },
    ],
  });
};

describe("Shop model", () => {
  it("대표 이미지를 두 장 이상 저장할 수 없다", async () => {
    await expect(createShop().validate()).rejects.toThrow(
      "대표 이미지는 최대 한 장만 저장할 수 있습니다.",
    );
  });
});
