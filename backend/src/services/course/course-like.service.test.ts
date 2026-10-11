import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { likeCourse, unlikeCourse } from "./course-like.service.js";

const modelMocks = vi.hoisted(() => ({
  findCourseById: vi.fn(),
  updateLike: vi.fn(),
  deleteLike: vi.fn(),
  countLikes: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: { findById: modelMocks.findCourseById },
}));

vi.mock("../../models/course-like.model.js", () => ({
  default: {
    updateOne: modelMocks.updateLike,
    deleteOne: modelMocks.deleteLike,
    countDocuments: modelMocks.countLikes,
  },
}));

const userId = "6a8a68e15e2aa43be6a6549d";
const otherUserId = new Types.ObjectId("6a8a68e15e2aa43be6a6549e");
const courseId = "6a8a68e15e2aa43be6a6549f";

/** 서비스가 사용하는 Mongoose 조회 체인을 지정한 코스로 응답하게 합니다. */
function givenCourse(course: unknown) {
  modelMocks.findCourseById.mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(course),
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.updateLike.mockResolvedValue({ acknowledged: true });
  modelMocks.deleteLike.mockResolvedValue({ deletedCount: 1 });
  modelMocks.countLikes.mockResolvedValue(1);
});

describe("likeCourse", () => {
  it("다른 사용자의 공개 코스를 좋아요합니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: otherUserId,
      courseType: "user_created",
      isPublic: true,
    });

    await expect(likeCourse(userId, courseId)).resolves.toEqual({
      courseId,
      isLiked: true,
      likeCount: 1,
    });
  });

  it("추천 코스를 좋아요합니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: null,
      courseType: "recommended",
      isPublic: true,
    });

    await expect(likeCourse(userId, courseId)).resolves.toMatchObject({
      isLiked: true,
    });
  });

  it("본인이 만든 코스는 좋아요할 수 없습니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: new Types.ObjectId(userId),
      courseType: "user_created",
      isPublic: true,
    });

    await expect(likeCourse(userId, courseId)).rejects.toMatchObject({
      code: "COURSE_SELF_LIKE_NOT_ALLOWED",
    });
  });

  it("다른 사용자의 비공개 코스는 새로 좋아요할 수 없습니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: otherUserId,
      courseType: "user_created",
      isPublic: false,
    });

    await expect(likeCourse(userId, courseId)).rejects.toMatchObject({
      code: "COURSE_PRIVATE",
    });
  });

  it("동시 요청의 중복 키 충돌을 기존 좋아요 성공으로 처리합니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: otherUserId,
      courseType: "user_created",
      isPublic: true,
    });
    modelMocks.updateLike.mockRejectedValue({ code: 11000 });

    await expect(likeCourse(userId, courseId)).resolves.toMatchObject({
      isLiked: true,
      likeCount: 1,
    });
  });
});

describe("unlikeCourse", () => {
  it("코스가 비공개가 되어도 기존 좋아요를 해제합니다", async () => {
    modelMocks.countLikes.mockResolvedValue(0);

    await expect(unlikeCourse(userId, courseId)).resolves.toEqual({
      courseId,
      isLiked: false,
      likeCount: 0,
    });
    expect(modelMocks.deleteLike).toHaveBeenCalledOnce();
  });
});
