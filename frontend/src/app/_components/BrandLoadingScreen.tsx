import Image from "next/image";

/** 소품지도의 가치와 다음 진입 경로를 한 화면에 안내합니다. */
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
        <div className="relative mb-7 size-36 motion-safe:animate-[onboarding-float_3.6s_ease-in-out_infinite] min-[390px]:size-40">
          <Image
            src="/images/brand/symbol.svg"
            alt="소품지도 심볼"
            fill
            priority
            sizes="160px"
            className="object-contain"
          />
          <span
            aria-hidden="true"
            className="absolute -right-3 top-2 text-24 text-green-500"
          >
            ✦
          </span>
          <span
            aria-hidden="true"
            className="absolute -left-5 bottom-10 text-20 text-green-300"
          >
            ♡
          </span>
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
