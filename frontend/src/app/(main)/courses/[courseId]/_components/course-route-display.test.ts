import { describe, expect, it } from "vitest";

import { getStraightCoursePath } from "./course-route-display";

describe("getStraightCoursePath", () => {
  it("상점 좌표를 방문 순서대로 정렬해 직선 경로를 만듭니다", () => {
    expect(
      getStraightCoursePath([
        { order: 3, latitude: 37.3, longitude: 127.3 },
        { order: 1, latitude: 37.1, longitude: 127.1 },
        { order: 2, latitude: 37.2, longitude: 127.2 },
      ]),
    ).toEqual([
      { latitude: 37.1, longitude: 127.1 },
      { latitude: 37.2, longitude: 127.2 },
      { latitude: 37.3, longitude: 127.3 },
    ]);
  });
});
