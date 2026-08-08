import Image from "next/image";

/** 화면이 준비되는 동안 소품지도 브랜드와 마스코트를 보여줍니다. */
export function BrandLoadingScreen() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 size-72 rounded-full bg-green-100/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-green-500/10 blur-3xl"
      />

      <section
        aria-labelledby="onboarding-title"
        className="relative z-10 flex flex-1 flex-col items-center justify-center text-center"
      >
        <div className="relative mb-7 motion-safe:animate-[onboarding-float_3.6s_ease-in-out_infinite]">
          <Image
            src="/images/brand/sopum-map-mascot.svg"
            alt="소품지도 마스코트"
            width={114}
            height={135}
            priority
            className="h-auto w-[114px] object-contain"
          />
        </div>

        <h1
          id="onboarding-title"
          className="text-24 font-bold tracking-[-0.04em] text-green-700"
        >
          소품지도
        </h1>
        <p className="mt-3 max-w-72 text-16 leading-7 text-black-800">
          취향에 맞는 소품샵을 찾고,
          <br />내 픽으로 모아 코스를 만들어보세요.
        </p>
      </section>

      <p className="relative z-10 mt-5 text-center text-12 tracking-[0.05em] text-black-500">
        © 2026 Sopumjido
      </p>
    </main>
  );
}
