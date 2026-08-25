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
  it("기본적으로 활성 매장만 조회한다", () => {
    expect(buildShopMatchFilter(defaultParams)).toEqual({
      status: "active",
    });
  });

  it("전달된 분류와 지역 조건을 조회 조건에 추가한다", () => {
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

  it("검색어를 상점명과 주소 검색 조건으로 변환한다", () => {
    const filter = buildShopMatchFilter({
      ...defaultParams,
      keyword: "소품",
    });

    const conditions = filter.$or as Array<Record<string, RegExp>>;

    expect(conditions).toHaveLength(2);

    expect(conditions[0].name.test("소품 가게")).toBe(true);
    expect(conditions[1].address.test("서울 소품 거리")).toBe(true);
  });

  it("검색어 앞뒤 공백을 제거한다", () => {
    const filter = buildShopMatchFilter({
      ...defaultParams,
      keyword: "  소품  ",
    });

    const conditions = filter.$or as Array<Record<string, RegExp>>;

    expect(conditions[0].name.source).toBe("소품");
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
  it("좌표가 없으면 $match를 첫 번째 단계로 사용한다", () => {
    const pipeline = buildShopListPipeline(defaultParams);

    expect(pipeline[0]).toEqual({
      $match: {
        status: "active",
      },
    });
  });

  it("좌표가 없으면 최신순 페이지네이션을 적용한다", () => {
    expect(
      buildShopListPipeline({
        ...defaultParams,
        page: 3,
        limit: 10,
      }),
    ).toEqual([
      {
        $match: {
          status: "active",
        },
      },
      {
        $facet: {
          items: [
            {
              $sort: {
                createdAt: -1,
                _id: -1,
              },
            },
            {
              $skip: 20,
            },
            {
              $limit: 10,
            },
          ],
          count: [
            {
              $count: "totalCount",
            },
          ],
        },
      },
    ]);
  });

  it("좌표가 있으면 $geoNear를 첫 번째 단계로 사용한다", () => {
    const pipeline = buildShopListPipeline({
      ...defaultParams,
      lat: 37.5665,
      lng: 126.978,
    });

    expect(pipeline[0]).toEqual({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [126.978, 37.5665],
        },
        key: "location",
        distanceField: "distance",
        spherical: true,
        query: {
          status: "active",
        },
      },
    });
  });

  it("좌표와 radius가 있으면 maxDistance를 적용한다", () => {
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
          query: {
            status: "active",
          },
          maxDistance: 1500,
        },
      },
      {
        $facet: {
          items: [
            {
              $sort: {
                distance: 1,
                _id: 1,
              },
            },
            {
              $skip: 0,
            },
            {
              $limit: 20,
            },
          ],
          count: [
            {
              $count: "totalCount",
            },
          ],
        },
      },
    ]);
  });

  it("좌표만 있고 radius가 없으면 maxDistance를 추가하지 않는다", () => {
    const pipeline = buildShopListPipeline({
      ...defaultParams,
      lat: 37.5665,
      lng: 126.978,
      sort: "distance",
    });

    const geoNearStage = pipeline[0] as {
      $geoNear: Record<string, unknown>;
    };

    expect(geoNearStage.$geoNear).not.toHaveProperty("maxDistance");
  });

  it("거리순은 distance 오름차순을 사용한다", () => {
    const pipeline = buildShopListPipeline({
      ...defaultParams,
      lat: 37.5665,
      lng: 126.978,
      sort: "distance",
    });

    expect(pipeline[1]).toEqual({
      $facet: {
        items: [
          {
            $sort: {
              distance: 1,
              _id: 1,
            },
          },
          {
            $skip: 0,
          },
          {
            $limit: 20,
          },
        ],
        count: [
          {
            $count: "totalCount",
          },
        ],
      },
    });
  });

  it("인기순은 좋아요 수와 생성일을 차례로 사용한다", () => {
    const pipeline = buildShopListPipeline({
      ...defaultParams,
      sort: "bookmark",
    });

    expect(pipeline[1]).toEqual({
      $facet: {
        items: [
          {
            $sort: {
              likeCount: -1,
              createdAt: -1,
              _id: -1,
            },
          },
          {
            $skip: 0,
          },
          {
            $limit: 20,
          },
        ],
        count: [
          {
            $count: "totalCount",
          },
        ],
      },
    });
  });
});
