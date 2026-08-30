"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { Button } from "@/components/ui/Button";

import {
  getNextSlide,
  getPreviousSlide,
  getSwipeDirection,
} from "./onboarding-carousel";
import { ONBOARDING_SLIDES } from "./onboarding-slides";
import { OnboardingSlide } from "./OnboardingSlide";

type OnboardingCarouselProps = Readonly<{
  onComplete: () => void;
}>;

/** 네 기능 안내를 버튼, 방향키, 스와이프로 차례대로 탐색하게 합니다. */
export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pointerStartXRef = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousIndexRef = useRef(currentIndex);
  const currentSlide = ONBOARDING_SLIDES[currentIndex];
  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  useEffect(() => {
    if (previousIndexRef.current === currentIndex) {
      return;
    }

    previousIndexRef.current = currentIndex;
    headingRef.current?.focus();
  }, [currentIndex]);

  /** 현재 범위 안에서 이전 안내 페이지로 이동합니다. */
  function showPreviousSlide() {
    setCurrentIndex((index) => getPreviousSlide(index));
  }

  /** 현재 범위 안에서 다음 안내 페이지로 이동합니다. */
  function showNextSlide() {
    setCurrentIndex((index) =>
      getNextSlide(index, ONBOARDING_SLIDES.length),
    );
  }

  /** 키보드 방향키를 같은 이전·다음 탐색 동작으로 연결합니다. */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousSlide();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextSlide();
    }
  }

  /** 가로 포인터 이동의 시작점을 기록합니다. */
  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    pointerStartXRef.current = event.clientX;
  }

  /** 충분한 가로 이동을 이전 또는 다음 페이지 탐색으로 바꿉니다. */
  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const startX = pointerStartXRef.current;
    pointerStartXRef.current = null;

    if (startX === null) {
      return;
    }

    const direction = getSwipeDirection(startX, event.clientX);

    if (direction === "previous") {
      showPreviousSlide();
    }

    if (direction === "next") {
      showNextSlide();
    }
  }

  return (
    <main
      tabIndex={0}
      aria-label="소품지도 기능 안내"
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStartXRef.current = null;
      }}
      className="flex min-h-dvh touch-pan-y flex-col bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 min-[390px]:px-5 min-[390px]:pt-[max(2rem,env(safe-area-inset-top))]"
    >
      <div className="flex flex-1 items-center justify-center py-4">
        <OnboardingSlide slide={currentSlide} headingRef={headingRef} />
      </div>

      <nav aria-label="온보딩 페이지 이동" className="w-full">
        <p className="sr-only" aria-live="polite">
          {`${ONBOARDING_SLIDES.length}페이지 중 ${currentIndex + 1}페이지`}
        </p>
        <ol aria-hidden="true" className="flex justify-center gap-2">
          {ONBOARDING_SLIDES.map((slide, index) => (
            <li
              key={slide.id}
              className={
                index === currentIndex
                  ? "h-2 w-6 rounded-full bg-green-500"
                  : "size-2 rounded-full bg-black-200"
              }
            />
          ))}
        </ol>
        <div
          className={
            currentIndex > 0
              ? "mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2"
              : "mt-6 grid grid-cols-1"
          }
        >
          {currentIndex > 0 && (
            <Button variant="ghost" size="large" onClick={showPreviousSlide}>
              이전
            </Button>
          )}
          <Button
            fullWidth
            size="large"
            onClick={isLastSlide ? onComplete : showNextSlide}
          >
            {isLastSlide ? "소품지도 시작하기" : "다음"}
          </Button>
        </div>
      </nav>
    </main>
  );
}
