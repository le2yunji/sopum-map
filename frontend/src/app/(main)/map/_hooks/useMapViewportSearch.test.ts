import { describe, expect, it } from "vitest";

import type { MapBounds } from "@/components/naver-map";

import {
  getMapViewportNeedsSearch,
  initialMapViewportSearchState,
  reduceMapViewportSearchState,
  type MapViewportSearchState,
} from "./useMapViewportSearch";

const initialBounds: MapBounds = {
  southWestLat: 37.5,
  southWestLng: 126.9,
  northEastLat: 37.6,
  northEastLng: 127.1,
};

const movedBounds: MapBounds = {
  southWestLat: 37.51,
  southWestLng: 126.91,
  northEastLat: 37.61,
  northEastLng: 127.11,
};

describe("map viewport search state", () => {
  it("최초 지도 경계를 현재 영역과 요청 영역으로 등록한다", () => {
    const state = reduceMapViewportSearchState(
      initialMapViewportSearchState,
      {
        type: "initialize",
        bounds: initialBounds,
      },
    );

    expect(state).toEqual({
      draftBounds: initialBounds,
      requestedBounds: initialBounds,
      searchedBounds: undefined,
    });
    expect(getMapViewportNeedsSearch(state)).toBe(false);
  });

  it("확정 영역과 다른 곳으로 이동하면 재검색이 필요하다", () => {
    let state = reduceMapViewportSearchState(
      initialMapViewportSearchState,
      {
        type: "initialize",
        bounds: initialBounds,
      },
    );
    state = reduceMapViewportSearchState(state, {
      type: "commit-search",
    });
    state = reduceMapViewportSearchState(state, {
      type: "update-draft",
      bounds: movedBounds,
    });

    expect(state.draftBounds).toEqual(movedBounds);
    expect(state.searchedBounds).toEqual(initialBounds);
    expect(getMapViewportNeedsSearch(state)).toBe(true);
  });

  it("재검색을 시작하고 성공하면 요청 영역을 확정한다", () => {
    let state: MapViewportSearchState = {
      draftBounds: movedBounds,
      requestedBounds: undefined,
      searchedBounds: initialBounds,
    };

    state = reduceMapViewportSearchState(state, {
      type: "start-search",
    });

    expect(state.requestedBounds).toEqual(movedBounds);
    expect(getMapViewportNeedsSearch(state)).toBe(false);

    state = reduceMapViewportSearchState(state, {
      type: "commit-search",
    });

    expect(state).toEqual({
      draftBounds: movedBounds,
      requestedBounds: undefined,
      searchedBounds: movedBounds,
    });
    expect(getMapViewportNeedsSearch(state)).toBe(false);
  });

  it("재검색이 실패하면 기존 확정 영역을 유지하고 다시 검색할 수 있다", () => {
    let state: MapViewportSearchState = {
      draftBounds: movedBounds,
      requestedBounds: movedBounds,
      searchedBounds: initialBounds,
    };

    state = reduceMapViewportSearchState(state, {
      type: "fail-search",
    });

    expect(state).toEqual({
      draftBounds: movedBounds,
      requestedBounds: undefined,
      searchedBounds: initialBounds,
    });
    expect(getMapViewportNeedsSearch(state)).toBe(true);
  });
});
