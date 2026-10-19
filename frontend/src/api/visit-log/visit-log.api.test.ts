// frontend/src/api/visit-log/visit-log.api.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({ apiClient: vi.fn() }));

vi.mock("../client", () => ({ apiClient: apiMocks.apiClient }));

import {
  createVisitLog,
  checkVisitLogAvailability,
  createVisitLogsSearchParams,
  deleteVisitLog,
  getMyVisitLog,
  getMyVisitLogs,
  updateVisitLog,
} from "./visit-log.api";

beforeEach(() => {
  vi.clearAllMocks();
  apiMocks.apiClient.mockResolvedValue({ visitLogId: "visit-log-1" });
});

describe("createVisitLogsSearchParams", () => {
  it("page와 limit을 query string으로 변환한다", () => {
    const result = createVisitLogsSearchParams({
      page: 2,
      limit: 10,
    });

    expect(result.toString()).toBe("page=2&limit=10");
  });

  it("값이 없으면 빈 query string을 반환한다", () => {
    const result = createVisitLogsSearchParams({});

    expect(result.toString()).toBe("");
  });
});

describe("createVisitLog", () => {
  it("상점 방문 로그 작성 주소에 요청 본문을 POST한다", async () => {
    const input = {
      visitedAt: "2026-10-13T03:00:00.000Z",
      selectedTagKeys: ["cute"],
      content: null,
      imageUploadIds: [],
    } as const;

    await expect(createVisitLog("shop-1", input)).resolves.toEqual({
      visitLogId: "visit-log-1",
    });
    expect(apiMocks.apiClient).toHaveBeenCalledWith(
      "/shops/shop-1/visit-logs",
      { method: "POST", body: input },
    );
  });
});

describe("checkVisitLogAvailability", () => {
  it("방문 시각을 query로 전달해 중복 여부를 확인한다", async () => {
    apiMocks.apiClient.mockResolvedValue({ canCreate: false });

    await expect(
      checkVisitLogAvailability("shop-1", "2026-10-13T03:00:00.000Z"),
    ).resolves.toEqual({ canCreate: false });
    expect(apiMocks.apiClient).toHaveBeenCalledWith(
      "/shops/shop-1/visit-logs/availability?visitedAt=2026-10-13T03%3A00%3A00.000Z",
    );
  });
});

describe("방문 로그 관리 API", () => {
  it("내 목록을 페이지 조건과 함께 조회한다", async () => {
    await getMyVisitLogs({ page: 2, limit: 10 });
    expect(apiMocks.apiClient).toHaveBeenCalledWith("/me/visit-logs?page=2&limit=10");
  });

  it("본인 로그 한 건을 조회한다", async () => {
    await getMyVisitLog("log-1");
    expect(apiMocks.apiClient).toHaveBeenCalledWith("/me/visit-logs/log-1");
  });

  it("본인 로그를 수정한다", async () => {
    const input = { visitedAt: "2026-10-13T03:00:00.000Z", selectedTagKeys: ["cute"] } as const;
    await updateVisitLog("log-1", input);
    expect(apiMocks.apiClient).toHaveBeenCalledWith("/visit-logs/log-1", { method: "PATCH", body: input });
  });

  it("본인 로그를 삭제한다", async () => {
    await deleteVisitLog("log-1");
    expect(apiMocks.apiClient).toHaveBeenCalledWith("/visit-logs/log-1", { method: "DELETE" });
  });
});
