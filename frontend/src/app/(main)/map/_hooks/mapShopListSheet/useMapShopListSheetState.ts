"use client";

import { useEffect, useState } from "react";
import { MapShopListSheetState } from "./mapShopListSheet.types";

export function useMapShopListSheetState() {
  const [state, setState] = useState<MapShopListSheetState>("collapsed");

  useEffect(() => {
    const savedState = sessionStorage.getItem("map-shop-list-sheet-state");

    if (savedState === "collapsed" || savedState === "expanded") {
      setState(savedState);
    }
  }, []);

  const changeState = (nextState: MapShopListSheetState) => {
    setState(nextState);

    sessionStorage.setItem("map-shop-list-sheet-state", nextState);
  };

  return [state, changeState] as const;
}
