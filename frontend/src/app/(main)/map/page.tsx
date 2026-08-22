import type { Metadata } from "next";

import { MapScreen } from "./_components/MapScreen";
import { MAP_SHOPS } from "./_data/map.fixture";

export const metadata: Metadata = { title: "지도" };

/** 지도 탐색 페이지를 표시합니다. */
export default function MapPage() {
  return <MapScreen shops={MAP_SHOPS} />;
}
