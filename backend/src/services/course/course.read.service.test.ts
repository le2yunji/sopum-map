import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findCourse: vi.fn(),
  findAuthor: vi.fn(),
  countLikes: vi.fn(),
  findCurrentLike: vi.fn(),
  findShops: vi.fn(),
  findVisits: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({ default: { findById: modelMocks.findCourse } }));
vi.mock("../../models/user.model.js", () => ({ default: { findById: modelMocks.findAuthor } }));
vi.mock("../../models/course-like.model.js", () => ({ default: { countDocuments: modelMocks.countLikes, exists: modelMocks.findCurrentLike } }));
vi.mock("../../models/shop.model.js", () => ({ default: { find: modelMocks.findShops } }));
vi.mock("../../models/course-shop-visit.model.js", () => ({ default: { find: modelMocks.findVisits } }));

import { getCourseDetail } from "./course.read.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const courseId = "6a8a68e15e2aa43be6a6549e";
const firstShopId = "6a8a68e15e2aa43be6a6549f";
const secondShopId = "6a8a68e15e2aa43be6a654a0";

/** Mongoose의 select().lean() 조회를 테스트 값으로 대체합니다. */
function selectedLean(value: unknown) {
  return { select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findCourse.mockReturnValue({ lean: vi.fn().mockResolvedValue({
    _id: new Types.ObjectId(courseId), courseType: "user_created", userId: new Types.ObjectId(userId),
    sourceFolderId: null, title: "성수 산책", description: null, regionGroup: "seongsu-seoulforest",
    isPublic: false, createdAt: new Date("2026-10-01T00:00:00.000Z"), updatedAt: new Date("2026-10-01T00:00:00.000Z"),
    shops: [
      { shopId: new Types.ObjectId(firstShopId), order: 1, memo: null },
      { shopId: new Types.ObjectId(secondShopId), order: 2, memo: null },
    ],
  }) });
  modelMocks.findAuthor.mockReturnValue(selectedLean({ _id: new Types.ObjectId(userId), nickname: "작성자" }));
  modelMocks.countLikes.mockResolvedValue(0);
  modelMocks.findCurrentLike.mockResolvedValue(null);
  modelMocks.findShops.mockReturnValue(selectedLean([
    { _id: new Types.ObjectId(firstShopId), name: "첫 상점", address: "서울", images: [], regionGroup: "seongsu-seoulforest", location: { type: "Point", coordinates: [127, 37] }, status: "active" },
    { _id: new Types.ObjectId(secondShopId), name: "둘째 상점", address: "서울", images: [], regionGroup: "seongsu-seoulforest", location: { type: "Point", coordinates: [127.1, 37.1] }, status: "active" },
  ]));
  modelMocks.findVisits.mockReturnValue(selectedLean([{ shopId: new Types.ObjectId(secondShopId) }]));
});

describe("getCourseDetail visit state", () => {
  it("방문 문서를 한 번 조회해 각 상점의 방문 상태를 표시한다", async () => {
    const result = await getCourseDetail(userId, courseId);

    expect(modelMocks.findVisits).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      shopId: { $in: [new Types.ObjectId(firstShopId), new Types.ObjectId(secondShopId)] },
    });
    expect(result.shops.map((shop) => [shop.id, shop.isVisited])).toEqual([
      [firstShopId, false],
      [secondShopId, true],
    ]);
  });
});
