import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  mapPublicCourseListItem,
  selectRepresentativeTagKeys,
} from "./public-course-list.mapper.js";

describe("selectRepresentativeTagKeys", () => {
  it("상점 등장 횟수와 태그 정의 순서로 대표 태그를 최대 2개 고른다", () => {
    const shops = [
      {
        tagStats: [
          { key: "vintage" as const, count: 100 },
          { key: "stickers" as const, count: 1 },
        ],
      },
      {
        tagStats: [
          { key: "stickers" as const, count: 1 },
          { key: "keyrings" as const, count: 1 },
        ],
      },
      {
        tagStats: [{ key: "keyrings" as const, count: 1 }],
      },
    ];

    expect(selectRepresentativeTagKeys(shops)).toEqual([
      "keyrings",
      "stickers",
    ]);
  });
});

describe("mapPublicCourseListItem", () => {
  it("방문 순서의 상점 이미지 4개와 안전한 기본값을 반환한다", () => {
    const shopIds = Array.from(
      { length: 5 },
      (_, index) => new Types.ObjectId(`6a8a68e15e2aa43be6a6549${index}`),
    );
    const course = {
      _id: new Types.ObjectId("6a8a68e15e2aa43be6a6548f"),
      courseType: "user_created" as const,
      userId: new Types.ObjectId("6a8a68e15e2aa43be6a6548e"),
      title: "성수 산책",
      description: null,
      regionGroup: "seongsu-seoulforest" as const,
      isPublic: true,
      likeCount: 3,
      isOfficialPick: true,
      shops: shopIds.map((shopId, index) => ({ shopId, order: index + 1 })),
      createdAt: new Date("2026-11-01T00:00:00.000Z"),
    };
    const shopById = new Map(
      shopIds.map((shopId, index) => [
        shopId.toString(),
        {
          _id: shopId,
          images: [
            {
              imageUrl: `https://example.com/${index}.jpg`,
              isMain: true,
            },
          ],
          tagStats: [],
        },
      ]),
    );

    expect(mapPublicCourseListItem(course, null, shopById)).toMatchObject({
      imageUrls: [
        "https://example.com/0.jpg",
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
        "https://example.com/3.jpg",
      ],
      representativeTagKeys: [],
      author: { displayName: "알 수 없는 사용자" },
      isOfficialPick: true,
    });
  });

  it("추천 코스는 DB Pick 값과 관계없이 소품지도 작성자로 표시한다", () => {
    const item = mapPublicCourseListItem(
      {
        _id: new Types.ObjectId("6a8a68e15e2aa43be6a6548f"),
        courseType: "recommended",
        userId: null,
        title: "추천 산책",
        description: null,
        regionGroup: "mangwon",
        isPublic: true,
        likeCount: 0,
        isOfficialPick: true,
        shops: [],
        createdAt: new Date("2026-11-01T00:00:00.000Z"),
      },
      null,
      new Map(),
    );

    expect(item).toMatchObject({
      author: { displayName: "소품지도", isService: true },
      imageUrls: [],
      isOfficialPick: false,
    });
  });
});
