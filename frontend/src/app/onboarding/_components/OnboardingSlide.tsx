import type { Ref } from "react";

import type { OnboardingSlideData } from "./onboarding-slides";

type OnboardingSlideProps = Readonly<{
  slide: OnboardingSlideData;
  headingRef: Ref<HTMLHeadingElement>;
}>;

/** 한 온보딩 페이지의 그림과 핵심 설명을 읽기 좋은 순서로 보여줍니다. */
export function OnboardingSlide({ slide, headingRef }: OnboardingSlideProps) {
  const titleId = `onboarding-${slide.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col items-center text-center"
    >
      {slide.visual}
      <h1
        ref={headingRef}
        id={titleId}
        tabIndex={-1}
        className="mt-6 text-22 font-bold tracking-[-0.03em] text-black-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-4 min-[390px]:mt-7 min-[390px]:text-24"
      >
        {slide.title}
      </h1>
      <p className="mt-3 max-w-80 text-14 leading-6 text-black-600 min-[390px]:text-16 min-[390px]:leading-7">
        {slide.description}
      </p>
    </article>
  );
}
