import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findShop: vi.fn(),
  findVisitLogs: vi.fn(),
  countVisitLogs: vi.fn(),
  findUsers: vi.fn(),
}));

vi.mock("../../models/shop.model.js", () => ({ default: { exists: modelMocks.findShop } }));
vi.mock("../../models/visit-log.model.js", () => ({
  default: { find: modelMocks.findVisitLogs, countDocuments: modelMocks.countVisitLogs },
}));
vi.mock("../../models/user.model.js", () => ({ default: { find: modelMocks.findUsers } }));

import { getVisitLogs } from "./visit-log.service.js";

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findShop.mockResolvedValue({ _id: "shop-1" });
  modelMocks.findVisitLogs.mockReturnValue({
    sort: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }) }),
    }),
  });
  modelMocks.countVisitLogs.mockResolvedValue(0);
  modelMocks.findUsers.mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }) });
});

describe("getVisitLogs", () => {
  it("공개 목록과 개수에서 삭제된 로그를 제외한다", async () => {
    await getVisitLogs({ shopId: "shop-1", userId: "user-1", page: 1, limit: 10 });

    expect(modelMocks.findVisitLogs).toHaveBeenCalledWith({ shopId: "shop-1", status: "active" });
    expect(modelMocks.countVisitLogs).toHaveBeenCalledWith({ shopId: "shop-1", status: "active" });
  });
});
