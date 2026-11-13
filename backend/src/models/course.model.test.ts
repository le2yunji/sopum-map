import { describe, expect, it } from "vitest";

import CourseModel from "./course.model.js";

describe("CourseModel indexes", () => {
  it("사용자·원본 폴더·지역 조합을 사용자 코스에서만 고유하게 유지합니다", () => {
    const indexes = CourseModel.schema.indexes();

    expect(indexes).toContainEqual([
      { userId: 1, sourceFolderId: 1, regionGroup: 1 },
      {
        unique: true,
        partialFilterExpression: {
          courseType: "user_created",
          sourceFolderId: { $type: "objectId" },
        },
      },
    ]);
  });

  it("새 코스는 likeCount 0과 isOfficialPick false를 사용한다", () => {
    const course = new CourseModel({
      courseType: "user_created",
      userId: "6a8a68e15e2aa43be6a6549d",
      title: "성수 산책",
      regionGroup: "seongsu-seoulforest",
      shops: [
        { shopId: "6a8a68e15e2aa43be6a6549e", order: 1 },
        { shopId: "6a8a68e15e2aa43be6a6549f", order: 2 },
      ],
    });

    expect(course.likeCount).toBe(0);
    expect(course.isOfficialPick).toBe(false);
  });

  it("공개 코스의 지역과 정렬 조합에 맞는 인덱스를 사용한다", () => {
    const indexFields = CourseModel.schema.indexes().map(([fields]) => fields);

    expect(indexFields).toEqual(
      expect.arrayContaining([
        {
          isPublic: 1,
          createdAt: -1,
          _id: -1,
        },
        {
          isPublic: 1,
          regionGroup: 1,
          createdAt: -1,
          _id: -1,
        },
        {
          isPublic: 1,
          likeCount: -1,
          createdAt: -1,
          _id: -1,
        },
        {
          isPublic: 1,
          regionGroup: 1,
          likeCount: -1,
          createdAt: -1,
          _id: -1,
        },
      ]),
    );
  });
});
