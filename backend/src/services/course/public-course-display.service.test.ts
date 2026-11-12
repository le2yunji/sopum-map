import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findUsers: vi.fn(),
  findShops: vi.fn(),
}));

vi.mock("../../models/user.model.js", () => ({
  default: { find: modelMocks.findUsers },
}));
vi.mock("../../models/shop.model.js", () => ({
  default: { find: modelMocks.findShops },
}));

import { loadPublicCourseListItems } from "./public-course-display.service.js";

/** 표시 서비스가 사용하는 선택 조회 체인을 만듭니다. */
function selectedQuery(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(value),
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findUsers.mockReturnValue(selectedQuery([]));
  modelMocks.findShops.mockReturnValue(selectedQuery([]));
});

describe("loadPublicCourseListItems", () => {
  it("중복 ID를 제거한 사용자·상점 묶음 조회를 각각 한 번 수행한다", async () => {
    const userId = new Types.ObjectId("6a8a68e15e2aa43be6a6549d");
    const shopId = new Types.ObjectId("6a8a68e15e2aa43be6a6549e");
    const shared = {
      courseType: "user_created" as const,
      userId,
      title: "성수 산책",
      description: null,
      regionGroup: "seongsu-seoulforest" as const,
      isPublic: true,
      shops: [{ shopId, order: 1 }],
      createdAt: new Date("2026-11-01T00:00:00.000Z"),
    };

    await loadPublicCourseListItems([
      { ...shared, _id: new Types.ObjectId("6a8a68e15e2aa43be6a6549f") },
      { ...shared, _id: new Types.ObjectId("6a8a68e15e2aa43be6a654a0") },
    ]);

    expect(modelMocks.findUsers).toHaveBeenCalledOnce();
    expect(modelMocks.findUsers).toHaveBeenCalledWith({
      _id: { $in: [userId] },
    });
    expect(modelMocks.findShops).toHaveBeenCalledOnce();
    expect(modelMocks.findShops).toHaveBeenCalledWith({
      _id: { $in: [shopId] },
    });
  });
});
