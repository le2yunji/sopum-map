import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findCourse: vi.fn(),
  setVisit: vi.fn(),
  unsetVisit: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: { findById: modelMocks.findCourse },
}));

vi.mock("../../models/course-shop-visit.model.js", () => ({
  default: {
    updateOne: modelMocks.setVisit,
    deleteOne: modelMocks.unsetVisit,
  },
}));

import {
  setCourseShopVisited,
  unsetCourseShopVisited,
} from "./course-shop-visit.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const otherUserId = "6a8a68e15e2aa43be6a6549e";
const courseId = "6a8a68e15e2aa43be6a6549f";
const shopId = "6a8a68e15e2aa43be6a654a0";

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findCourse.mockReturnValue({
    lean: vi.fn().mockResolvedValue({
      courseType: "user_created",
      userId: new Types.ObjectId(userId),
      isPublic: false,
      shops: [{ shopId: new Types.ObjectId(shopId) }],
    }),
  });
  modelMocks.setVisit.mockResolvedValue({ acknowledged: true });
  modelMocks.unsetVisit.mockResolvedValue({ acknowledged: true });
});

describe("course shop visit service", () => {
  it("방문 상태를 멱등하게 저장한다", async () => {
    await expect(setCourseShopVisited(userId, courseId, shopId)).resolves.toEqual({
      isVisited: true,
    });

    expect(modelMocks.setVisit).toHaveBeenCalledWith(
      {
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
        shopId: new Types.ObjectId(shopId),
      },
      {
        $setOnInsert: {
          userId: new Types.ObjectId(userId),
          courseId: new Types.ObjectId(courseId),
          shopId: new Types.ObjectId(shopId),
        },
      },
      { upsert: true },
    );
  });

  it("방문 상태를 멱등하게 해제한다", async () => {
    await expect(unsetCourseShopVisited(userId, courseId, shopId)).resolves.toEqual({
      isVisited: false,
    });
    expect(modelMocks.unsetVisit).toHaveBeenCalledOnce();
  });

  it("코스에 포함되지 않은 상점을 거부한다", async () => {
    await expect(
      setCourseShopVisited(userId, courseId, otherUserId),
    ).rejects.toMatchObject({ status: 404, code: "SHOP_NOT_IN_COURSE" });
    expect(modelMocks.setVisit).not.toHaveBeenCalled();
  });

  it("다른 사용자의 비공개 코스를 거부한다", async () => {
    modelMocks.findCourse.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        courseType: "user_created",
        userId: new Types.ObjectId(otherUserId),
        isPublic: false,
        shops: [{ shopId: new Types.ObjectId(shopId) }],
      }),
    });

    await expect(
      setCourseShopVisited(userId, courseId, shopId),
    ).rejects.toMatchObject({ status: 403, code: "COURSE_PRIVATE" });
  });

  it("없는 코스를 거부한다", async () => {
    modelMocks.findCourse.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });

    await expect(
      setCourseShopVisited(userId, courseId, shopId),
    ).rejects.toMatchObject({ status: 404, code: "COURSE_NOT_FOUND" });
  });
});
