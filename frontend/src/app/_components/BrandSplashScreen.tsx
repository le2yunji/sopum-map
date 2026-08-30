import { SparkleIcon } from "@/components/icons/SparkleIcon";
import Image from "next/image";

/** 소품지도의 브랜드 메시지를 보여주는 스플래시 화면입니다. */
export function BrandSplashScreen() {
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
        aria-labelledby="brand-title"
        className="relative z-10 flex flex-1 flex-col items-center justify-center text-center"
      >
        <div className="relative mb-7 size-36 motion-safe:animate-[onboarding-float_3.6s_ease-in-out_infinite] min-[390px]:size-40">
          <Image
            src="/images/brand/mascot.webp"
            alt="소품지도 심볼"
            fill
            sizes="160px"
            className="object-contain"
          />

          <SparkleIcon
            aria-hidden="true"
            className="absolute -right-4 top-1 size-8 text-green-300"
          />

          <span
            aria-hidden="true"
            className="absolute -left-5 bottom-10 text-20 text-green-300"
          >
            ♡
          </span>
        </div>

        <h1
          id="brand-title"
          className="text-24 font-bold tracking-[-0.04em] text-green-700"
        >
          소품지도
        </h1>
        <p className="mt-3 text-16 leading-7 text-black-800">
          행운을 찾는 소품산책
        </p>
      </section>

      <p className="relative z-10 mt-5 text-center text-12 tracking-[0.05em] text-black-500">
        © 2026 Sopumjido
      </p>
    </main>
  );
}
