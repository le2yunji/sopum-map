import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  createCourseCursorPage,
  mapLikedCourseListItem,
  mapMyCourseListItem,
} from "./course-list.mapper.js";

const createdAt = new Date("2026-10-12T00:00:00.000Z");
const courseId = new Types.ObjectId("6a8a68e15e2aa43be6a6549d");

const course = {
  _id: courseId,
  courseType: "user_created" as const,
  userId: new Types.ObjectId("6a8a68e15e2aa43be6a6549e"),
  sourceFolderId: null,
  title: "성수 소품 산책",
  description: "천천히 둘러보는 코스",
  regionGroup: "seongsu-seoulforest" as const,
  isPublic: true,
  shops: [{ shopId: new Types.ObjectId(), order: 1 }],
  createdAt,
  updatedAt: createdAt,
};

describe("createCourseCursorPage", () => {
  it("21개를 조회하면 20개와 다음 커서를 반환합니다", () => {
    const documents = Array.from({ length: 21 }, (_, index) => ({
      _id: new Types.ObjectId(),
      createdAt: new Date(createdAt.getTime() - index),
      value: index,
    }));

    const page = createCourseCursorPage(documents, 20, (document) =>
      document.value.toString(),
    );

    expect(page.items).toHaveLength(20);
    expect(page.hasNext).toBe(true);
    expect(page.nextCursor).not.toBeNull();
  });
});

describe("mapMyCourseListItem", () => {
  it("내 코스에 공개 여부와 받은 좋아요 수를 포함합니다", () => {
    expect(
      mapMyCourseListItem(course, {
        mainImageUrl: "https://example.com/shop.webp",
        likeCount: 7,
      }),
    ).toMatchObject({
      id: courseId.toString(),
      isPublic: true,
      likeCount: 7,
    });
  });
});

describe("mapLikedCourseListItem", () => {
  it("공개 코스에 작성자와 좋아요 수를 포함합니다", () => {
    const item = mapLikedCourseListItem({
      course,
      likedAt: createdAt,
      mainImageUrl: "https://example.com/shop.webp",
      likeCount: 7,
      author: {
        id: course.userId.toString(),
        displayName: "소품 수집가",
        profileImageUrl: null,
        isService: false,
      },
    });

    expect(item).toMatchObject({
      isPrivate: false,
      author: { displayName: "소품 수집가" },
      likeCount: 7,
    });
  });

  it("비공개 코스는 식별자와 찜한 시각 외 정보를 노출하지 않습니다", () => {
    const item = mapLikedCourseListItem({
      course: { ...course, isPublic: false },
      likedAt: createdAt,
      mainImageUrl: "https://example.com/shop.webp",
      likeCount: 7,
      author: {
        id: course.userId.toString(),
        displayName: "숨겨야 하는 이름",
        profileImageUrl: "https://example.com/profile.webp",
        isService: false,
      },
    });

    expect(item).toEqual({
      id: courseId.toString(),
      isPrivate: true,
      likedAt: createdAt.toISOString(),
    });
  });
});
