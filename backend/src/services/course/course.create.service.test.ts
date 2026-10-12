import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findFolderById: vi.fn(),
  countFolderItems: vi.fn(),
  findShops: vi.fn(),
  findCourse: vi.fn(),
  createCourse: vi.fn(),
  createCourseShopsWithWalkingMetrics: vi.fn(),
}));

vi.mock("../../models/pick-folder.model.js", () => ({
  default: { findById: modelMocks.findFolderById },
}));

vi.mock("../../models/pick-folder-item.model.js", () => ({
  default: { countDocuments: modelMocks.countFolderItems },
}));

vi.mock("../../models/shop.model.js", () => ({
  default: { find: modelMocks.findShops },
}));

vi.mock("../../models/course.model.js", () => ({
  default: {
    findOne: modelMocks.findCourse,
    create: modelMocks.createCourse,
  },
}));

vi.mock("./course-walking-metrics.service.js", () => ({
  createCourseShopsWithWalkingMetrics:
    modelMocks.createCourseShopsWithWalkingMetrics,
}));

import { createCourse } from "./course.create.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const otherUserId = "6a8a68e15e2aa43be6a6549e";
const folderId = "6a8a68e15e2aa43be6a6549f";
const courseId = "6a8a68e15e2aa43be6a654a0";
const shopIds = [
  "6a8a68e15e2aa43be6a654a1",
  "6a8a68e15e2aa43be6a654a2",
] as const;

const regionGroup = "seongsu-seoulforest" as const;

const input = {
  sourceFolderId: folderId,
  regionGroup,
  title: "성수 소품 산책",
  description: "천천히 둘러보는 코스",
  shops: [
    { shopId: shopIds[0], order: 1, memo: null },
    { shopId: shopIds[1], order: 2, memo: "두 번째 방문" },
  ],
} as const;

/** Mongoose의 select().lean() 조회 결과를 지정합니다. */
function mockLeanQuery(mock: ReturnType<typeof vi.fn>, result: unknown) {
  mock.mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(result),
    }),
  });
}

/** 생성 가능한 기본 폴더와 상점 조회 결과를 준비합니다. */
function givenValidCourseSource() {
  mockLeanQuery(modelMocks.findFolderById, {
    _id: new Types.ObjectId(folderId),
    userId: new Types.ObjectId(userId),
  });
  mockLeanQuery(modelMocks.findCourse, null);
  modelMocks.countFolderItems.mockResolvedValue(2);
  mockLeanQuery(
    modelMocks.findShops,
    shopIds.map((shopId, index) => ({
      _id: new Types.ObjectId(shopId),
      regionGroup,
      status: index === 0 ? "active" : "temporarily_closed",
      location: {
        type: "Point",
        coordinates: [127.04 + index * 0.01, 37.54 + index * 0.01],
      },
    })),
  );
  modelMocks.createCourseShopsWithWalkingMetrics.mockResolvedValue(
    input.shops,
  );
  modelMocks.createCourse.mockResolvedValue({
    _id: new Types.ObjectId(courseId),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  givenValidCourseSource();
});

describe("createCourse", () => {
  it("요청 지역의 운영 중·임시 휴무 상점으로 비공개 사용자 코스를 생성합니다", async () => {
    await expect(createCourse(userId, input)).resolves.toEqual({ courseId });

    expect(modelMocks.findCourse).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      sourceFolderId: new Types.ObjectId(folderId),
      regionGroup,
      courseType: "user_created",
    });
    expect(modelMocks.createCourse).toHaveBeenCalledWith(
      expect.objectContaining({
        courseType: "user_created",
        userId: new Types.ObjectId(userId),
        sourceFolderId: new Types.ObjectId(folderId),
        regionGroup,
        isPublic: false,
      }),
    );
  });

  it("다른 사용자의 폴더이면 403 오류를 반환합니다", async () => {
    mockLeanQuery(modelMocks.findFolderById, {
      _id: new Types.ObjectId(folderId),
      userId: new Types.ObjectId(otherUserId),
    });

    await expect(createCourse(userId, input)).rejects.toMatchObject({
      status: 403,
      code: "PICK_FOLDER_FORBIDDEN",
    });
  });

  it("선택한 상점이 원본 폴더에 모두 포함되지 않으면 거부합니다", async () => {
    modelMocks.countFolderItems.mockResolvedValue(1);

    await expect(createCourse(userId, input)).rejects.toMatchObject({
      status: 400,
      code: "INVALID_COURSE_FOLDER_SHOP",
    });
  });

  it("요청 지역과 다른 상점이 포함되면 거부합니다", async () => {
    mockLeanQuery(modelMocks.findShops, [
      {
        _id: new Types.ObjectId(shopIds[0]),
        regionGroup,
        status: "active",
        location: { coordinates: [127.04, 37.54] },
      },
      {
        _id: new Types.ObjectId(shopIds[1]),
        regionGroup: "hongdae-yeonnam",
        status: "active",
        location: { coordinates: [126.92, 37.56] },
      },
    ]);

    await expect(createCourse(userId, input)).rejects.toMatchObject({
      status: 400,
      code: "COURSE_REGION_MISMATCH",
    });
  });

  it.each([
    ["hidden", "COURSE_SHOP_HIDDEN"],
    ["closed", "COURSE_SHOP_CLOSED"],
  ] as const)("%s 상점이 포함되면 %s 오류로 거부합니다", async (status, code) => {
    mockLeanQuery(
      modelMocks.findShops,
      shopIds.map((shopId) => ({
        _id: new Types.ObjectId(shopId),
        regionGroup,
        status,
        location: { coordinates: [127.04, 37.54] },
      })),
    );

    await expect(createCourse(userId, input)).rejects.toMatchObject({
      status: 400,
      code,
    });
  });

  it("위치 정보가 없는 상점이 포함되면 거부합니다", async () => {
    mockLeanQuery(
      modelMocks.findShops,
      shopIds.map((shopId) => ({
        _id: new Types.ObjectId(shopId),
        regionGroup,
        status: "active",
        location: null,
      })),
    );

    await expect(createCourse(userId, input)).rejects.toMatchObject({
      status: 400,
      code: "COURSE_SHOP_LOCATION_REQUIRED",
    });
  });

  it("같은 폴더와 지역의 코스가 있으면 기존 courseId를 반환합니다", async () => {
    mockLeanQuery(modelMocks.findCourse, {
      _id: new Types.ObjectId(courseId),
    });

    await expect(createCourse(userId, input)).rejects.toMatchObject({
      status: 409,
      code: "COURSE_ALREADY_EXISTS",
      details: { courseId },
    });
  });

  it("동시 생성의 고유 인덱스 충돌에도 기존 courseId를 반환합니다", async () => {
    mockLeanQuery(modelMocks.findCourse, null);
    modelMocks.createCourse.mockRejectedValue({ code: 11000 });

    const lean = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: new Types.ObjectId(courseId) });
    modelMocks.findCourse.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean }),
    });

    await expect(createCourse(userId, input)).rejects.toMatchObject({
      status: 409,
      code: "COURSE_ALREADY_EXISTS",
      details: { courseId },
    });
  });
});
