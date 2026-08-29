"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import Image from "next/image";

type OnboardingErrorProps = Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>;

/** 온보딩 경로의 예상하지 못한 오류를 격리하고 복구 방법을 제공합니다. */
export default function OnboardingError({
  error,
  unstable_retry,
}: OnboardingErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-5 text-center">
      <span aria-hidden="true" className="text-24 text-green-500">
        <Image
          src={"/images/icons/clover.webp"}
          alt={"클로버 이미지"}
          width={50}
          height={50}
        />
      </span>
      <h1 className="mt-4 text-20 font-semibold text-black-950">
        온보딩 화면을 불러오지 못했어요
      </h1>
      <p className="mt-2 text-14 text-black-500">
        잠시 후 다시 시도하거나 로그인 화면으로 이동해 주세요.
      </p>

      <div className="mt-10 flex w-full max-w-72 flex-col gap-2">
        <Button fullWidth size="large" onClick={unstable_retry}>
          다시 시도
        </Button>
        <Link
          href="/login"
          className="flex min-h-12 items-center justify-center rounded-xl px-4 text-14 text-black-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          로그인 화면으로 이동
        </Link>
      </div>
    </main>
  );
}
