import { describe, expect, it } from "vitest";

import { getCourseShopCoordinates } from "./course.helper.js";

describe("getCourseShopCoordinates", () => {
  it("유효한 상점 위치를 위도와 경도로 반환합니다", () => {
    expect(
      getCourseShopCoordinates({
        location: { coordinates: [127.04, 37.54] },
      }),
    ).toEqual({ latitude: 37.54, longitude: 127.04 });
  });

  it("기존 상점의 위치가 없어지면 빈 좌표를 반환합니다", () => {
    expect(getCourseShopCoordinates({ location: null })).toEqual({
      latitude: null,
      longitude: null,
    });
  });
});
