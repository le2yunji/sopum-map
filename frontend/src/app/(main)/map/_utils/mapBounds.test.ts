import { describe, expect, it } from "vitest";

import type { MapBounds } from "@/components/naver-map";

import { areMapBoundsEqual, normalizeMapBounds } from "./mapBounds";

const bounds: MapBounds = {
  southWestLat: 37.5,
  southWestLng: 126.9,
  northEastLat: 37.6,
  northEastLng: 127.1,
};

describe("map bounds", () => {
  it("지도 경계를 일관된 소수점 정밀도로 정규화한다", () => {
    expect(
      normalizeMapBounds({
        southWestLat: 37.500004,
        southWestLng: 126.900004,
        northEastLat: 37.600006,
        northEastLng: 127.100006,
      }),
    ).toEqual({
      southWestLat: 37.5,
      southWestLng: 126.9,
      northEastLat: 37.60001,
      northEastLng: 127.10001,
    });
  });

  it("소수점 오차만 있는 경계는 같은 영역으로 판단한다", () => {
    expect(
      areMapBoundsEqual(bounds, {
        southWestLat: 37.500004,
        southWestLng: 126.900004,
        northEastLat: 37.600004,
        northEastLng: 127.100004,
      }),
    ).toBe(true);
  });

  it("사용자가 의미 있게 이동한 경계는 다른 영역으로 판단한다", () => {
    expect(
      areMapBoundsEqual(bounds, {
        ...bounds,
        northEastLat: 37.60002,
      }),
    ).toBe(false);
  });

  it("두 경계가 모두 없을 때만 같은 초기 상태로 판단한다", () => {
    expect(areMapBoundsEqual(undefined, undefined)).toBe(true);
    expect(areMapBoundsEqual(bounds, undefined)).toBe(false);
  });
});
