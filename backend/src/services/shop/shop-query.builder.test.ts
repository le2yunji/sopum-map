import { describe, expect, it } from "vitest";

import {
  buildShopListPipeline,
  buildShopMatchFilter,
} from "./shop-query.builder";
import type { GetShopsServiceParams } from "./shop.service.types";

const defaultParams: GetShopsServiceParams = {
  page: 1,
  limit: 20,
  sort: "latest",
};

describe("buildShopMatchFilter", () => {
  it("활성 매장과 전달된 분류·지역 조건만 조회한다", () => {
    expect(
      buildShopMatchFilter({
        ...defaultParams,
        category: "소품샵",
        region1: "서울특별시",
        region2: "마포구",
        region3: "연남동",
      }),
    ).toEqual({
      status: "active",
      category: "소품샵",
      region1: "서울특별시",
      region2: "마포구",
      region3: "연남동",
    });
  });

  it("검색어의 정규식 문자를 일반 문자로 처리한다", () => {
    const filter = buildShopMatchFilter({
      ...defaultParams,
      keyword: " 소품.* ",
    });

    const conditions = filter.$or as Array<Record<string, RegExp>>;
    expect(conditions[0].name.source).toBe("소품\\.\\*");
    expect(conditions[0].name.flags).toContain("i");
    expect(conditions[1].address.source).toBe("소품\\.\\*");
  });
});

describe("buildShopListPipeline", () => {
  it("좌표가 없으면 필터 뒤에 최신순 페이지네이션을 적용한다", () => {
    expect(
      buildShopListPipeline({
        ...defaultParams,
        page: 3,
        limit: 10,
      }),
    ).toEqual([
      { $match: { status: "active" } },
      {
        $facet: {
          items: [
            { $sort: { createdAt: -1, _id: -1 } },
            { $skip: 20 },
            { $limit: 10 },
          ],
          metadata: [{ $count: "totalCount" }],
        },
      },
    ]);
  });

  it("좌표가 있으면 경도·위도 순서로 거리 검색과 반경을 적용한다", () => {
    expect(
      buildShopListPipeline({
        ...defaultParams,
        lat: 37.5665,
        lng: 126.978,
        radius: 1500,
        sort: "distance",
      }),
    ).toEqual([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [126.978, 37.5665],
          },
          key: "location",
          distanceField: "distance",
          spherical: true,
          query: { status: "active" },
          maxDistance: 1500,
        },
      },
      {
        $facet: {
          items: [
            { $sort: { distance: 1, _id: 1 } },
            { $skip: 0 },
            { $limit: 20 },
          ],
          metadata: [{ $count: "totalCount" }],
        },
      },
    ]);
  });

  it("인기순은 좋아요 수와 생성일을 차례로 사용한다", () => {
    const pipeline = buildShopListPipeline({
      ...defaultParams,
      sort: "bookmark",
    });

    expect(pipeline[1]).toEqual({
      $facet: {
        items: [
          { $sort: { likeCount: -1, createdAt: -1, _id: -1 } },
          { $skip: 0 },
          { $limit: 20 },
        ],
        metadata: [{ $count: "totalCount" }],
      },
    });
  });
});
