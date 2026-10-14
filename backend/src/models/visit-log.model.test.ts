import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import VisitLogModel from "./visit-log.model.js";

/** 모델 검증에 필요한 최소 방문 로그를 생성합니다. */
function createVisitLog(overrides: Record<string, unknown> = {}) {
  return new VisitLogModel({
    userId: new Types.ObjectId(),
    shopId: new Types.ObjectId(),
    visitedAt: new Date("2026-10-13T03:00:00.000Z"),
    selectedTagKeys: ["cute"],
    ...overrides,
  });
}

describe("VisitLog model", () => {
  it("새 방문 로그에 active 상태와 빈 이미지 키를 기본값으로 적용한다", async () => {
    const visitLog = createVisitLog();

    await visitLog.validate();

    expect(visitLog.status).toBe("active");
    expect(visitLog.imageKeys).toEqual([]);
  });

  it.each([
    ["태그 없음", []],
    ["6개 태그", ["cute", "vintage", "cozy", "hip", "lovely", "kitsch"]],
    ["중복 태그", ["cute", "cute"]],
    ["폐기된 태그", ["calm"]],
  ])("%s을 거부한다", async (_, selectedTagKeys) => {
    const visitLog = createVisitLog({ selectedTagKeys: [...selectedTagKeys] });

    await expect(visitLog.validate()).rejects.toThrow();
  });

  it("방문 글은 1,000자까지 허용한다", async () => {
    await expect(
      createVisitLog({ content: "가".repeat(1_000) }).validate(),
    ).resolves.toBeUndefined();
  });

  it("1,000자를 초과한 방문 글을 거부한다", async () => {
    await expect(
      createVisitLog({ content: "가".repeat(1_001) }).validate(),
    ).rejects.toThrow();
  });

  it("공개 상점 로그와 내 로그를 최신 방문일순으로 조회할 인덱스를 가진다", () => {
    const indexes = VisitLogModel.schema.indexes();

    expect(indexes).toContainEqual([
      { shopId: 1, status: 1, visitedAt: -1, _id: -1 },
      expect.any(Object),
    ]);
    expect(indexes).toContainEqual([
      { userId: 1, status: 1, visitedAt: -1, _id: -1 },
      expect.any(Object),
    ]);
  });
});
