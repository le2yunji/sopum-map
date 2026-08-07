import Link from "next/link";

/** 상점 상세 UI가 완성되기 전에도 유효한 경로와 복구 동선을 제공합니다. */
export default function ShopDetailPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <h1 className="text-20 font-semibold text-black-950">
        상점 정보를 준비하고 있어
      </h1>
      <p className="mt-2 text-14 text-black-500">
        곧 자세한 상점 정보와 후기를 확인할 수 있어.
      </p>
      <Link
        href="/"
        className="mt-6 flex min-h-11 items-center justify-center rounded-xl bg-green-500 px-5 text-14 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
