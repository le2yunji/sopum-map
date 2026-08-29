"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandSplashScreen } from "@/app/_components/BrandSplashScreen";
import {
  createOnboardingCookie,
  startOnboardingTransition,
} from "@/lib/onboarding/onboarding";

import { OnboardingCarousel } from "./OnboardingCarousel";

/** 브랜드 화면 뒤에 기능 안내를 보여주고 완료를 한 번만 처리합니다. */
export function OnboardingScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"splash" | "guide">("splash");
  const completedRef = useRef(false);

  useEffect(() => {
    return startOnboardingTransition(() => setPhase("guide"));
  }, []);

  /** 완료 상태를 한 번만 저장하고 홈 화면으로 이동합니다. */
  function completeOnboarding() {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    document.cookie = createOnboardingCookie(
      window.location.protocol === "https:",
    );
    router.replace("/");
  }

  return phase === "splash" ? (
    <BrandSplashScreen />
  ) : (
    <OnboardingCarousel onComplete={completeOnboarding} />
  );
}
