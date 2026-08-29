import type { Metadata } from "next";

import { MapScreen } from "./_components/MapScreen";
import { MAP_SHOPS } from "./_data/map.fixture";

export const metadata: Metadata = {
  title: "지도",
  description: "성수, 홍대, 연남 등 주변 소품샵을 지도에서 찾아보세요.",
};

/** 지도 탐색 페이지를 표시합니다. */
export default function MapPage() {
  return <MapScreen shops={MAP_SHOPS} />;
}
