import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteCourse } from "./course.delete.service.js";

const modelMocks = vi.hoisted(() => ({
  findCourseById: vi.fn(),
  deleteCourse: vi.fn(),
  deleteLikes: vi.fn(),
  deleteVisits: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: {
    findById: modelMocks.findCourseById,
    deleteOne: modelMocks.deleteCourse,
  },
}));

vi.mock("../../models/course-like.model.js", () => ({
  default: { deleteMany: modelMocks.deleteLikes },
}));

vi.mock("../../models/course-shop-visit.model.js", () => ({
  default: { deleteMany: modelMocks.deleteVisits },
}));

const userId = "6a8a68e15e2aa43be6a6549d";
const courseId = "6a8a68e15e2aa43be6a6549f";

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findCourseById.mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(courseId),
        userId: new Types.ObjectId(userId),
        courseType: "user_created",
      }),
    }),
  });
  modelMocks.deleteCourse.mockResolvedValue({ deletedCount: 1 });
  modelMocks.deleteLikes.mockResolvedValue({ deletedCount: 2 });
  modelMocks.deleteVisits.mockResolvedValue({ deletedCount: 2 });
});

describe("deleteCourse", () => {
  it("코스를 삭제한 뒤 연결된 좋아요도 정리합니다", async () => {
    await deleteCourse(userId, courseId);

    expect(modelMocks.deleteLikes).toHaveBeenCalledWith({
      courseId: new Types.ObjectId(courseId),
    });
    expect(modelMocks.deleteVisits).toHaveBeenCalledWith({
      courseId: new Types.ObjectId(courseId),
    });
  });
});
