import { describe, expect, it } from "vitest";

import { getCourseMapInteractionOptions } from "./course-map-options";

describe("getCourseMapInteractionOptions", () => {
  it("화면 버튼은 숨기고 손가락 지도 조작은 유지합니다", () => {
    expect(getCourseMapInteractionOptions()).toMatchObject({
      draggable: true,
      pinchZoom: true,
      scrollWheel: true,
      zoomControl: false,
    });
  });
});
