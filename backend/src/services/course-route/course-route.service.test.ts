import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OptimizeCourseRouteRequest } from "@sopum-map/shared";

const modelMocks = vi.hoisted(() => ({
  findFolder: vi.fn(),
  findFolderItems: vi.fn(),
  findCourse: vi.fn(),
  findShops: vi.fn(),
  getWalkingDistanceMatrix: vi.fn(),
  optimizeCourseRoute: vi.fn(),
}));

vi.mock("../../models/pick-folder.model.js", () => ({
  default: { exists: modelMocks.findFolder },
}));

vi.mock("../../models/pick-folder-item.model.js", () => ({
  default: { find: modelMocks.findFolderItems },
}));

vi.mock("../../models/course.model.js", () => ({
  default: { findOne: modelMocks.findCourse },
}));

vi.mock("../../models/shop.model.js", () => ({
  default: { find: modelMocks.findShops },
}));

vi.mock("./walking-distance-matrix.service.js", () => ({
  getWalkingDistanceMatrix: modelMocks.getWalkingDistanceMatrix,
}));

vi.mock("./course-route-optimizer.service.js", () => ({
  optimizeCourseRoute: modelMocks.optimizeCourseRoute,
}));

import { optimizeUserCourseRoute } from "./course-route.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const folderId = "6a8a68e15e2aa43be6a6549e";
const courseId = "6a8a68e15e2aa43be6a6549f";
const folderShopId = "6a8a68e15e2aa43be6a654a0";
const removedFolderShopId = "6a8a68e15e2aa43be6a654a1";

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
  modelMocks.findFolder.mockResolvedValue({ _id: new Types.ObjectId(folderId) });
  mockLeanQuery(modelMocks.findFolderItems, [
    { shopId: new Types.ObjectId(folderShopId) },
  ]);
  mockLeanQuery(modelMocks.findCourse, {
    _id: new Types.ObjectId(courseId),
    shops: [
      { shopId: new Types.ObjectId(folderShopId) },
      { shopId: new Types.ObjectId(removedFolderShopId) },
    ],
  });
  mockLeanQuery(modelMocks.findShops, [
    {
      _id: new Types.ObjectId(folderShopId),
      regionGroup: "seongsu-seoulforest",
      status: "active",
      location: { coordinates: [127.04, 37.54] },
    },
    {
      _id: new Types.ObjectId(removedFolderShopId),
      regionGroup: "seongsu-seoulforest",
      status: "active",
      location: { coordinates: [127.05, 37.55] },
    },
  ]);
  modelMocks.getWalkingDistanceMatrix.mockResolvedValue([
    [0, 100],
    [100, 0],
  ]);
  modelMocks.optimizeCourseRoute.mockReturnValue({
    orderedIndexes: [0, 1],
    totalDistanceMeters: 100,
  });
});

describe("optimizeUserCourseRoute", () => {
  it("폴더에서 삭제됐지만 기존 코스에 남은 상점은 수정 경로 계산에 포함합니다", async () => {
    const input: OptimizeCourseRouteRequest & { courseId: string } = {
      sourceFolderId: folderId,
      courseId,
      regionGroup: "seongsu-seoulforest",
      shopIds: [folderShopId, removedFolderShopId],
    };

    await expect(
      optimizeUserCourseRoute({ userId, input }),
    ).resolves.toEqual({
      shopIds: [folderShopId, removedFolderShopId],
      totalDistanceMeters: 100,
    });
  });

  it("생성 경로 계산은 폴더에 없는 상점을 계속 거부합니다", async () => {
    await expect(
      optimizeUserCourseRoute({
        userId,
        input: {
          sourceFolderId: folderId,
          regionGroup: "seongsu-seoulforest",
          shopIds: [folderShopId, removedFolderShopId],
        },
      }),
    ).rejects.toMatchObject({ code: "INVALID_COURSE_SHOPS" });

    expect(modelMocks.findCourse).not.toHaveBeenCalled();
  });

  it("사용자와 원본 폴더가 일치하지 않는 코스는 수정 허용 목록에 쓰지 않습니다", async () => {
    mockLeanQuery(modelMocks.findCourse, null);

    await expect(
      optimizeUserCourseRoute({
        userId,
        input: {
          sourceFolderId: folderId,
          courseId,
          regionGroup: "seongsu-seoulforest",
          shopIds: [folderShopId, removedFolderShopId],
        },
      }),
    ).rejects.toMatchObject({ code: "COURSE_NOT_FOUND" });
  });
});
