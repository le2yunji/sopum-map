import type { Metadata } from "next";

import { HomeScreen } from "./_home/components/HomeScreen";

export const metadata: Metadata = {
  title: "홈",
};

/** 임시 표시 데이터를 사용해 홈 탐색 화면을 제공합니다. */
export default function HomePage() {
  return <HomeScreen />;
}
