import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findFolders: vi.fn(),
  findFolder: vi.fn(),
  folderExists: vi.fn(),
  deleteFolder: vi.fn(),
  aggregateFolderItems: vi.fn(),
  findFolderItems: vi.fn(),
  deleteFolderItems: vi.fn(),
  findShops: vi.fn(),
  findCourses: vi.fn(),
  updateCourses: vi.fn(),
}));

vi.mock("../../models/pick-folder.model.js", () => ({
  default: {
    find: modelMocks.findFolders,
    findOne: modelMocks.findFolder,
    exists: modelMocks.folderExists,
    deleteOne: modelMocks.deleteFolder,
  },
}));

vi.mock("../../models/pick-folder-item.model.js", () => ({
  default: {
    aggregate: modelMocks.aggregateFolderItems,
    find: modelMocks.findFolderItems,
    deleteMany: modelMocks.deleteFolderItems,
  },
}));

vi.mock("../../models/shop.model.js", () => ({
  default: { find: modelMocks.findShops },
}));

vi.mock("../../models/shop-like.model.js", () => ({
  default: {},
}));

vi.mock("../../models/course.model.js", () => ({
  default: {
    find: modelMocks.findCourses,
    updateMany: modelMocks.updateCourses,
  },
}));

import {
  deletePickFolder,
  getMyPickFolders,
  getPickFolderCourseRegions,
} from "./pick-folder.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const folderId = "6a8a68e15e2aa43be6a6549e";
const folderObjectId = new Types.ObjectId(folderId);

/** Mongoose의 select().lean() 조회 결과를 지정합니다. */
function mockSelectLeanQuery(mock: ReturnType<typeof vi.fn>, result: unknown) {
  mock.mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(result),
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.deleteFolder.mockResolvedValue({ deletedCount: 1 });
  modelMocks.deleteFolderItems.mockResolvedValue({ deletedCount: 2 });
  modelMocks.updateCourses.mockResolvedValue({ modifiedCount: 2 });
});

describe("폴더의 지역별 코스 연결 정책", () => {
  it("폴더 목록에 지역별 코스 연결 목록을 반환합니다", async () => {
    modelMocks.findFolders.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: folderObjectId,
            title: "주말 산책",
            description: null,
            order: 0,
          },
        ]),
      }),
    });
    modelMocks.aggregateFolderItems.mockResolvedValue([
      { _id: folderObjectId, count: 4 },
    ]);
    mockSelectLeanQuery(modelMocks.findCourses, [
      {
        _id: new Types.ObjectId("6a8a68e15e2aa43be6a654a0"),
        sourceFolderId: folderObjectId,
        regionGroup: "seongsu-seoulforest",
      },
      {
        _id: new Types.ObjectId("6a8a68e15e2aa43be6a654a1"),
        sourceFolderId: folderObjectId,
        regionGroup: "hongdae-yeonnam",
      },
    ]);

    await expect(getMyPickFolders(userId)).resolves.toEqual({
      items: [
        {
          id: folderId,
          title: "주말 산책",
          description: null,
          order: 0,
          shopCount: 4,
          courses: [
            {
              courseId: "6a8a68e15e2aa43be6a654a0",
              regionGroup: "seongsu-seoulforest",
            },
            {
              courseId: "6a8a68e15e2aa43be6a654a1",
              regionGroup: "hongdae-yeonnam",
            },
          ],
        },
      ],
    });
  });

  it("지역별 생성 가능 상점 수와 기존 courseId를 함께 반환합니다", async () => {
    modelMocks.folderExists.mockResolvedValue({ _id: folderObjectId });
    mockSelectLeanQuery(modelMocks.findFolderItems, [
      { shopId: new Types.ObjectId("6a8a68e15e2aa43be6a654a2") },
      { shopId: new Types.ObjectId("6a8a68e15e2aa43be6a654a3") },
      { shopId: new Types.ObjectId("6a8a68e15e2aa43be6a654a4") },
    ]);
    mockSelectLeanQuery(modelMocks.findCourses, [
      {
        _id: new Types.ObjectId("6a8a68e15e2aa43be6a654a0"),
        regionGroup: "seongsu-seoulforest",
      },
    ]);
    mockSelectLeanQuery(modelMocks.findShops, [
      {
        _id: new Types.ObjectId("6a8a68e15e2aa43be6a654a2"),
        regionGroup: "seongsu-seoulforest",
        status: "active",
        location: { coordinates: [127.04, 37.54] },
      },
      {
        _id: new Types.ObjectId("6a8a68e15e2aa43be6a654a3"),
        regionGroup: "seongsu-seoulforest",
        status: "temporarily_closed",
        location: { coordinates: [127.05, 37.55] },
      },
      {
        _id: new Types.ObjectId("6a8a68e15e2aa43be6a654a4"),
        regionGroup: "hongdae-yeonnam",
        status: "closed",
        location: { coordinates: [126.92, 37.56] },
      },
    ]);

    await expect(
      getPickFolderCourseRegions(userId, folderId),
    ).resolves.toEqual({
      items: [
        {
          regionGroup: "seongsu-seoulforest",
          shopCount: 2,
          availableShopCount: 2,
          temporarilyClosedShopCount: 1,
          courseId: "6a8a68e15e2aa43be6a654a0",
        },
        {
          regionGroup: "hongdae-yeonnam",
          shopCount: 1,
          availableShopCount: 0,
          temporarilyClosedShopCount: 0,
          courseId: null,
        },
      ],
    });
  });

  it("폴더 삭제 시 연결된 모든 사용자 코스의 sourceFolderId를 정리합니다", async () => {
    mockSelectLeanQuery(modelMocks.findFolder, { _id: folderObjectId });

    await deletePickFolder(userId, folderId);

    expect(modelMocks.updateCourses).toHaveBeenCalledWith(
      {
        userId: new Types.ObjectId(userId),
        sourceFolderId: folderId,
        courseType: "user_created",
      },
      { $set: { sourceFolderId: null } },
    );
  });
});
