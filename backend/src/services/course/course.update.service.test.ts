import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findCourseById: vi.fn(),
  findShops: vi.fn(),
  countLikes: vi.fn(),
  updateCourse: vi.fn(),
  createCourseShopsWithWalkingMetrics: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: {
    findById: modelMocks.findCourseById,
    findByIdAndUpdate: modelMocks.updateCourse,
  },
}));

vi.mock("../../models/shop.model.js", () => ({
  default: { find: modelMocks.findShops },
}));

vi.mock("../../models/shop-like.model.js", () => ({
  default: { countDocuments: modelMocks.countLikes },
}));

vi.mock("./course-walking-metrics.service.js", () => ({
  createCourseShopsWithWalkingMetrics:
    modelMocks.createCourseShopsWithWalkingMetrics,
}));

import { updateCourse } from "./course.update.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const courseId = "6a8a68e15e2aa43be6a6549e";
const existingShopId = "6a8a68e15e2aa43be6a6549f";
const addedShopId = "6a8a68e15e2aa43be6a654a0";

/** Mongoose의 select().lean() 조회 결과를 지정합니다. */
function mockLeanQuery(mock: ReturnType<typeof vi.fn>, result: unknown) {
  mock.mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(result),
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  mockLeanQuery(modelMocks.findCourseById, {
    _id: new Types.ObjectId(courseId),
    userId: new Types.ObjectId(userId),
    courseType: "user_created",
    regionGroup: "seongsu-seoulforest",
    shops: [
      {
        shopId: new Types.ObjectId(existingShopId),
        order: 1,
        memo: null,
      },
    ],
  });

  modelMocks.createCourseShopsWithWalkingMetrics.mockImplementation(
    async (shops) => shops,
  );

  mockLeanQuery(modelMocks.updateCourse, {
    _id: new Types.ObjectId(courseId),
  });
});

describe("updateCourse", () => {
  it("기존 상점의 지역이 바뀌어도 코스에서 유지할 수 있습니다", async () => {
    mockLeanQuery(modelMocks.findShops, [
      {
        _id: new Types.ObjectId(existingShopId),
        regionGroup: "hongdae-yeonnam",
        status: "active",
        location: { coordinates: [126.92, 37.56] },
      },
    ]);

    await expect(
      updateCourse(userId, courseId, {
        shops: [{ shopId: existingShopId, order: 1, memo: "기존 상점" }],
      }),
    ).resolves.toEqual({ courseId });
  });

  it("기존 상점의 위치가 없어져도 코스를 수정할 수 있습니다", async () => {
    mockLeanQuery(modelMocks.findShops, [
      {
        _id: new Types.ObjectId(existingShopId),
        regionGroup: "seongsu-seoulforest",
        status: "active",
        location: null,
      },
    ]);

    await expect(
      updateCourse(userId, courseId, {
        shops: [{ shopId: existingShopId, order: 1, memo: "위치 없음" }],
      }),
    ).resolves.toEqual({ courseId });

    expect(
      modelMocks.createCourseShopsWithWalkingMetrics,
    ).not.toHaveBeenCalled();
  });

  it("새로 추가하는 상점은 기존 코스와 같은 지역이어야 합니다", async () => {
    mockLeanQuery(modelMocks.findShops, [
      {
        _id: new Types.ObjectId(existingShopId),
        regionGroup: "seongsu-seoulforest",
        status: "active",
        location: { coordinates: [127.04, 37.54] },
      },
      {
        _id: new Types.ObjectId(addedShopId),
        regionGroup: "hongdae-yeonnam",
        status: "active",
        location: { coordinates: [126.92, 37.56] },
      },
    ]);
    modelMocks.countLikes.mockResolvedValue(1);

    await expect(
      updateCourse(userId, courseId, {
        shops: [
          { shopId: existingShopId, order: 1 },
          { shopId: addedShopId, order: 2 },
        ],
      }),
    ).rejects.toMatchObject({ code: "COURSE_REGION_MISMATCH" });
  });
});
