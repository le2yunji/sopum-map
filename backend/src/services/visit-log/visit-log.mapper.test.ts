import { describe, expect, it } from "vitest";

import { mapVisitLogListItem } from "./visit-log.mapper.js";

describe("mapVisitLogListItem", () => {
  it("저장된 방문 태그 키를 목록 응답에 포함한다", () => {
    const result = mapVisitLogListItem({
      visitLog: {
        _id: "visit-log-id",
        selectedTagKeys: ["cute", "friendly"],
        content: null,
        images: [],
        visitedAt: new Date("2026-10-13T03:00:00.000Z"),
        createdAt: new Date("2026-10-13T04:00:00.000Z"),
      },
      author: {
        id: "user-id",
        nickname: "소품러버",
        profileImage: null,
        isMe: true,
      },
    });

    expect(result.selectedTagKeys).toEqual(["cute", "friendly"]);
  });

  it("기존 방문 로그에 태그 필드가 없으면 빈 배열을 반환한다", () => {
    const result = mapVisitLogListItem({
      visitLog: {
        _id: "legacy-visit-log-id",
        images: [],
        visitedAt: new Date("2026-10-13T03:00:00.000Z"),
        createdAt: new Date("2026-10-13T04:00:00.000Z"),
      },
      author: {
        id: "user-id",
        nickname: "소품러버",
        profileImage: null,
        isMe: false,
      },
    });

    expect(result.selectedTagKeys).toEqual([]);
  });
});
