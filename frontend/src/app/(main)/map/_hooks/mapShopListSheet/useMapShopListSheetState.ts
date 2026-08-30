"use client";

import { useState } from "react";
import { MapShopListSheetState } from "./mapShopListSheet.types";

/** 지도 진입 시 목록 시트를 접힌 상태로 시작하고 현재 상태를 관리합니다. */
export function useMapShopListSheetState() {
  const [state, setState] = useState<MapShopListSheetState>("collapsed");

  /** 사용자 조작에 따라 목록 시트의 표시 상태를 변경합니다. */
  const changeState = (nextState: MapShopListSheetState) => {
    setState(nextState);
  };

  return [state, changeState] as const;
}
