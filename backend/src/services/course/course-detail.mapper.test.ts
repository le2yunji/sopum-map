import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import { createCourseViewerData } from "./course-detail.mapper.js";

const viewerId = "6a8a68e15e2aa43be6a6549d";
const authorId = new Types.ObjectId("6a8a68e15e2aa43be6a6549e");

describe("createCourseViewerData", () => {
  it("사용자 코스의 작성자와 현재 사용자의 좋아요 상태를 만듭니다", () => {
    const result = createCourseViewerData({
      course: {
        courseType: "user_created",
        userId: authorId,
        isPublic: true,
      },
      viewerId,
      author: {
        _id: authorId,
        nickname: "소품 수집가",
        profileImage: "https://example.com/profile.webp",
      },
      likeCount: 12,
      isLiked: true,
    });

    expect(result).toEqual({
      author: {
        id: authorId.toString(),
        displayName: "소품 수집가",
        profileImageUrl: "https://example.com/profile.webp",
        isService: false,
      },
      isOwner: false,
      likeCount: 12,
      isLiked: true,
    });
  });

  it("추천 코스 작성자를 소품지도로 표시합니다", () => {
    const result = createCourseViewerData({
      course: {
        courseType: "recommended",
        userId: null,
        isPublic: true,
      },
      viewerId,
      author: null,
      likeCount: 3,
      isLiked: true,
    });

    expect(result.author).toEqual({
      id: null,
      displayName: "소품지도",
      profileImageUrl: null,
      isService: true,
    });
  });

  it("작성자를 찾을 수 없는 사용자 코스에 대체 이름을 표시합니다", () => {
    const result = createCourseViewerData({
      course: {
        courseType: "user_created",
        userId: authorId,
        isPublic: true,
      },
      viewerId,
      author: null,
      likeCount: 0,
      isLiked: false,
    });

    expect(result.author.displayName).toBe("알 수 없는 사용자");
  });

  it("작성자가 아닌 사용자의 비공개 코스 접근을 거부합니다", () => {
    expect(() =>
      createCourseViewerData({
        course: {
          courseType: "user_created",
          userId: authorId,
          isPublic: false,
        },
        viewerId,
        author: null,
        likeCount: 1,
        isLiked: true,
      }),
    ).toThrow(expect.objectContaining({ code: "COURSE_PRIVATE" }));
  });

  it("작성자 본인에게 좋아요 버튼 상태를 제공하지 않습니다", () => {
    const result = createCourseViewerData({
      course: {
        courseType: "user_created",
        userId: new Types.ObjectId(viewerId),
        isPublic: false,
      },
      viewerId,
      author: null,
      likeCount: 4,
      isLiked: true,
    });

    expect(result).toMatchObject({ isOwner: true, isLiked: false });
  });
});
