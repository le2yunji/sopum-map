import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMyActivitySummary } from "./user-activity.service.js";

const modelMocks = vi.hoisted(() => ({
  countCourses: vi.fn(),
  countVisitLogs: vi.fn(),
  findVisitLogShopIds: vi.fn(),
  findCourseVisitShopIds: vi.fn(),
  countActiveVisitedShops: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
  countMyVisitedShops: vi.fn(),
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

vi.mock("../../models/shop.model.js", () => ({
  default: { countDocuments: modelMocks.countActiveVisitedShops },
}));

vi.mock("./user-visited-shop.service.js", () => ({
  countMyVisitedShops: serviceMocks.countMyVisitedShops,
}));

const userId = "6a8a68e15e2aa43be6a6549d";

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.countCourses.mockResolvedValue(0);
  modelMocks.countVisitLogs.mockResolvedValue(0);
  modelMocks.findVisitLogShopIds.mockResolvedValue([]);
  modelMocks.findCourseVisitShopIds.mockResolvedValue([]);
  modelMocks.countActiveVisitedShops.mockResolvedValue(0);
  serviceMocks.countMyVisitedShops.mockResolvedValue(0);
});

describe("getMyActivitySummary", () => {
  it("활동이 없으면 모든 집계값을 0으로 반환한다", async () => {
    await expect(getMyActivitySummary(userId)).resolves.toEqual({
      createdCourseCount: 0,
      visitLogCount: 0,
      visitedShopCount: 0,
    });
  });

  it("방문 상점 서비스가 계산한 중복 없는 상점 수를 반환한다", async () => {
    modelMocks.countCourses.mockResolvedValue(2);
    modelMocks.countVisitLogs.mockResolvedValue(3);
    serviceMocks.countMyVisitedShops.mockResolvedValue(3);

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
    expect(serviceMocks.countMyVisitedShops).toHaveBeenCalledWith(userId);
  });
});
