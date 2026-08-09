import type { Metadata } from "next";

import { normalizeOnboardingDestination } from "@/lib/onboarding/onboarding";

import { OnboardingScreen } from "./_components/OnboardingScreen";

export const metadata: Metadata = {
  title: "온보딩",
  robots: {
    index: false,
    follow: false,
  },
};

/** 첫 방문자가 서비스의 핵심 가치를 확인하는 온보딩 경로입니다. */
type OnboardingPageProps = Readonly<{
  searchParams: Promise<{
    next?: string | string[];
  }>;
}>;

/** 첫 방문자가 서비스의 핵심 가치를 확인한 뒤 원래 경로로 이동합니다. */
export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const { next } = await searchParams;
  const destination = normalizeOnboardingDestination(next);

  return <OnboardingScreen destination={destination} />;
}
