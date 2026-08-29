import type { Metadata } from "next";

import { OnboardingScreen } from "./_components/OnboardingScreen";

export const metadata: Metadata = {
  title: "온보딩",
  robots: {
    index: false,
    follow: false,
  },
};

/** 첫 방문자가 서비스의 핵심 가치를 확인하는 온보딩 경로입니다. */
export default function OnboardingPage() {
  return <OnboardingScreen destination="/" />;
}
