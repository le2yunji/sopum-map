"use client";

import { useCallback, useReducer } from "react";

import type { MapBounds } from "@/components/naver-map";

import { areMapBoundsEqual, normalizeMapBounds } from "../_utils/mapBounds";

export type MapViewportSearchState = Readonly<{
  draftBounds: MapBounds | undefined;
  requestedBounds: MapBounds | undefined;
  searchedBounds: MapBounds | undefined;
}>;

type MapViewportSearchAction =
  | Readonly<{
      type: "initialize";
      bounds: MapBounds;
    }>
  | Readonly<{
      type: "update-draft";
      bounds: MapBounds;
    }>
  | Readonly<{
      type: "start-search";
    }>
  | Readonly<{
      type: "commit-search";
    }>
  | Readonly<{
      type: "fail-search";
    }>;

export const initialMapViewportSearchState: MapViewportSearchState = {
  draftBounds: undefined,
  requestedBounds: undefined,
  searchedBounds: undefined,
};

/** 지도 검색 영역의 상태 전이를 계산합니다. */
export function reduceMapViewportSearchState(
  state: MapViewportSearchState,
  action: MapViewportSearchAction,
): MapViewportSearchState {
  switch (action.type) {
    case "initialize": {
      const bounds = normalizeMapBounds(action.bounds);

      return {
        draftBounds: bounds,
        requestedBounds: bounds,
        searchedBounds: undefined,
      };
    }

    case "update-draft":
      return {
        ...state,
        draftBounds: normalizeMapBounds(action.bounds),
      };

    case "start-search":
      if (!state.draftBounds || state.requestedBounds) {
        return state;
      }

      return {
        ...state,
        requestedBounds: state.draftBounds,
      };

    case "commit-search":
      if (!state.requestedBounds) {
        return state;
      }

      return {
        ...state,
        requestedBounds: undefined,
        searchedBounds: state.requestedBounds,
      };

    case "fail-search":
      return {
        ...state,
        requestedBounds: undefined,
      };
  }
}

/** 현재 지도 영역에 재검색이 필요한지 판단합니다. */
export function getMapViewportNeedsSearch(
  state: MapViewportSearchState,
): boolean {
  if (!state.draftBounds || state.requestedBounds) {
    return false;
  }

  return !areMapBoundsEqual(state.draftBounds, state.searchedBounds);
}

/** 지도에서 보고 있는 영역과 검색이 확정된 영역을 관리합니다. */
export function useMapViewportSearch() {
  const [state, dispatch] = useReducer(
    reduceMapViewportSearchState,
    initialMapViewportSearchState,
  );

  /** 최초 지도 영역을 등록하고 첫 요청을 시작합니다. */
  const initializeBounds = useCallback((bounds: MapBounds) => {
    const normalizedBounds = normalizeMapBounds(bounds);

    dispatch({
      type: "initialize",
      bounds: normalizedBounds,
    });

    return normalizedBounds;
  }, []);

  /** 사용자가 이동한 현재 지도 영역을 저장합니다. */
  const updateDraftBounds = useCallback((bounds: MapBounds) => {
    dispatch({
      type: "update-draft",
      bounds,
    });
  }, []);

  /** 현재 보고 있는 지도 영역을 요청 영역으로 등록합니다. */
  const startSearch = useCallback((): MapBounds | undefined => {
    if (!state.draftBounds || state.requestedBounds) {
      return undefined;
    }

    dispatch({
      type: "start-search",
    });

    return state.draftBounds;
  }, [state.draftBounds, state.requestedBounds]);

  /** 두 상점 조회가 모두 성공한 요청 영역을 확정합니다. */
  const commitSearch = useCallback(() => {
    dispatch({
      type: "commit-search",
    });
  }, []);

  /** 실패한 요청 영역을 해제하고 기존 확정 영역을 유지합니다. */
  const failSearch = useCallback(() => {
    dispatch({
      type: "fail-search",
    });
  }, []);

  return {
    ...state,
    needsSearch: getMapViewportNeedsSearch(state),
    initializeBounds,
    updateDraftBounds,
    startSearch,
    commitSearch,
    failSearch,
  };
}
