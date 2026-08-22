import { describe, expect, it } from "vitest";

import { getMapMarkerIcon } from "./mapMarker";

describe("getMapMarkerIcon", () => {
  it("선택한 마커를 더 크게 표시합니다", () => {
    const selectedIcon = getMapMarkerIcon(true);
    const defaultIcon = getMapMarkerIcon(false);

    expect(selectedIcon.anchor).toEqual({ x: 19, y: 19 });
    expect(defaultIcon.anchor).toEqual({ x: 16, y: 16 });
    expect(selectedIcon.content).toContain("width:38px");
    expect(defaultIcon.content).toContain("width:32px");
  });
});
