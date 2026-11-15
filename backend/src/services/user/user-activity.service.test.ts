import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMyActivitySummary } from "./user-activity.service.js";

const modelMocks = vi.hoisted(() => ({
  countCourses: vi.fn(),
  countVisitLogs: vi.fn(),
  findVisitLogShopIds: vi.fn(),
  findCourseVisitShopIds: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: { countDocuments: modelMocks.countCourses },
}));

vi.mock("../../models/visit-log.model.js", () => ({
  default: {
    countDocuments: modelMocks.countVisitLogs,
    distinct: modelMocks.findVisitLogShopIds,
  },
}));

vi.mock("../../models/course-shop-visit.model.js", () => ({
  default: { distinct: modelMocks.findCourseVisitShopIds },
}));

const userId = "6a8a68e15e2aa43be6a6549d";

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.countCourses.mockResolvedValue(0);
  modelMocks.countVisitLogs.mockResolvedValue(0);
  modelMocks.findVisitLogShopIds.mockResolvedValue([]);
  modelMocks.findCourseVisitShopIds.mockResolvedValue([]);
});

describe("getMyActivitySummary", () => {
  it("활동이 없으면 모든 집계값을 0으로 반환한다", async () => {
    await expect(getMyActivitySummary(userId)).resolves.toEqual({
      createdCourseCount: 0,
      visitLogCount: 0,
      visitedShopCount: 0,
    });
  });

  it("활성 로그와 코스 방문 완료 상점의 합집합을 한 번씩 센다", async () => {
    const firstShopId = new Types.ObjectId();
    const sharedShopId = new Types.ObjectId();
    const lastShopId = new Types.ObjectId();

    modelMocks.countCourses.mockResolvedValue(2);
    modelMocks.countVisitLogs.mockResolvedValue(3);
    modelMocks.findVisitLogShopIds.mockResolvedValue([
      firstShopId,
      sharedShopId,
    ]);
    modelMocks.findCourseVisitShopIds.mockResolvedValue([
      sharedShopId,
      lastShopId,
      lastShopId,
    ]);

    await expect(getMyActivitySummary(userId)).resolves.toEqual({
      createdCourseCount: 2,
      visitLogCount: 3,
      visitedShopCount: 3,
    });

    const objectUserId = new Types.ObjectId(userId);
    expect(modelMocks.countCourses).toHaveBeenCalledWith({
      userId: objectUserId,
      courseType: "user_created",
    });
    expect(modelMocks.countVisitLogs).toHaveBeenCalledWith({
      userId: objectUserId,
      status: "active",
    });
    expect(modelMocks.findVisitLogShopIds).toHaveBeenCalledWith("shopId", {
      userId: objectUserId,
      status: "active",
    });
    expect(modelMocks.findCourseVisitShopIds).toHaveBeenCalledWith("shopId", {
      userId: objectUserId,
    });
  });
});
