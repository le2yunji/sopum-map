import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateCourseVisibility } from "./course-visibility.service.js";

const modelMocks = vi.hoisted(() => ({
  findCourseById: vi.fn(),
  updateCourse: vi.fn(),
  deleteLikes: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: {
    findById: modelMocks.findCourseById,
    updateOne: modelMocks.updateCourse,
  },
}));

vi.mock("../../models/course-like.model.js", () => ({
  default: { deleteMany: modelMocks.deleteLikes },
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
  modelMocks.updateCourse.mockResolvedValue({ matchedCount: 1 });
});

describe("updateCourseVisibility", () => {
  it("작성자가 사용자 코스를 비공개로 바꿔도 좋아요를 삭제하지 않습니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: new Types.ObjectId(userId),
      courseType: "user_created",
    });

    await expect(
      updateCourseVisibility(userId, courseId, false),
    ).resolves.toEqual({ courseId, isPublic: false });
    expect(modelMocks.deleteLikes).not.toHaveBeenCalled();
  });

  it("다른 사용자는 공개 여부를 변경할 수 없습니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: otherUserId,
      courseType: "user_created",
    });

    await expect(
      updateCourseVisibility(userId, courseId, true),
    ).rejects.toMatchObject({ code: "COURSE_FORBIDDEN" });
  });

  it("추천 코스의 공개 여부는 변경할 수 없습니다", async () => {
    givenCourse({
      _id: new Types.ObjectId(courseId),
      userId: null,
      courseType: "recommended",
    });

    await expect(
      updateCourseVisibility(userId, courseId, false),
    ).rejects.toMatchObject({ code: "COURSE_FORBIDDEN" });
  });
});
