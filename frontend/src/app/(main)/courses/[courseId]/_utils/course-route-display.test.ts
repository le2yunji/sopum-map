import { describe, expect, it } from "vitest";

import {
  formatWalkingSegment,
  getStraightCoursePath,
} from "./course-route-display";

describe("formatWalkingSegment", () => {
  it("1km 미만 구간을 올림한 도보 시간과 미터로 표시합니다", () => {
    expect(
      formatWalkingSegment({
        distanceMeters: 620,
        durationSeconds: 421,
      }),
    ).toBe("도보 8분 · 620m");
  });

  it("1km 이상 구간을 소수점 한 자리 km로 표시합니다", () => {
    expect(
      formatWalkingSegment({
        distanceMeters: 1250,
        durationSeconds: 720,
      }),
    ).toBe("도보 12분 · 1.3km");
  });
});

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

  it("위치 정보가 없는 기존 상점은 지도 경로에서 제외합니다", () => {
    expect(
      getStraightCoursePath([
        { order: 2, latitude: null, longitude: null },
        { order: 1, latitude: 37.1, longitude: 127.1 },
        { order: 3, latitude: 37.3, longitude: 127.3 },
      ]),
    ).toEqual([
      { latitude: 37.1, longitude: 127.1 },
      { latitude: 37.3, longitude: 127.3 },
    ]);
  });
});
