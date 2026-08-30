"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

type TabsErrorProps = Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>;

/** 탭 내부 오류를 하단 내비게이션과 분리하고 복구 동선을 제공합니다. */
export default function TabsError({ error, unstable_retry }: TabsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70dvh] flex-col items-center justify-center px-5 text-center">
      <span aria-hidden="true" className="text-24 text-green-500">
        <Image
          src={"/images/icons/clover.webp"}
          alt={"클로버 이미지"}
          width={50}
          height={50}
        />
      </span>
      <h1 className="mt-3 text-20 font-semibold text-black-950">
        화면을 불러오지 못했어요
      </h1>
      <p className="mt-2 text-14 text-black-500">
        다시 시도하거나 홈으로 이동해 주세요.
      </p>

      <div className="mt-10 flex w-full max-w-72 flex-col gap-2">
        <Button fullWidth onClick={unstable_retry}>
          다시 시도
        </Button>
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center rounded-xl text-14 text-black-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          홈으로 이동
        </Link>
      </div>
    </section>
  );
}
