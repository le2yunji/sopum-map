import { describe, expect, it } from "vitest";

import {
  formatWalkingSegment,
  getCourseRouteKey,
  getWalkingCoursePath,
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

describe("getWalkingCoursePath", () => {
  it("TMAP 경도·위도 좌표를 NAVER 지도용 위도·경도 좌표로 보존합니다", () => {
    expect(
      getWalkingCoursePath([
        { latitude: 37.1, longitude: 127.1 },
        { latitude: 37.2, longitude: 127.2 },
      ]),
    ).toEqual([
      { latitude: 37.1, longitude: 127.1 },
      { latitude: 37.2, longitude: 127.2 },
    ]);
  });

  it("유효하지 않은 좌표는 Polyline 경로에서 제외합니다", () => {
    expect(
      getWalkingCoursePath([
        { latitude: 37.1, longitude: 127.1 },
        { latitude: 95, longitude: 127.2 },
        { latitude: 37.3, longitude: 190 },
      ]),
    ).toEqual([{ latitude: 37.1, longitude: 127.1 }]);
  });
});

describe("getCourseRouteKey", () => {
  it("상점 순서가 달라지면 최초 화면 맞춤 기준도 달라집니다", () => {
    const firstKey = getCourseRouteKey([
      { id: "shop-1", order: 1 },
      { id: "shop-2", order: 2 },
    ]);
    const reversedKey = getCourseRouteKey([
      { id: "shop-1", order: 2 },
      { id: "shop-2", order: 1 },
    ]);

    expect(firstKey).not.toBe(reversedKey);
  });
});
