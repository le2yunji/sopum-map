"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { BrandLoadingScreen } from "@/app/_components/BrandLoadingScreen";
import {
  createOnboardingCookie,
  startOnboardingTransition,
} from "@/lib/onboarding/onboarding";

type OnboardingScreenProps = Readonly<{
  destination: string;
}>;

/** 브랜드 화면을 잠시 보여준 뒤 완료 상태를 기록하고 목적지로 이동합니다. */
export function OnboardingScreen({ destination }: OnboardingScreenProps) {
  const router = useRouter();

  useEffect(() => {
    return startOnboardingTransition(() => {
      document.cookie = createOnboardingCookie(
        window.location.protocol === "https:",
      );
      router.replace(destination);
    });
  }, [destination, router]);

  return <BrandLoadingScreen />;
}
