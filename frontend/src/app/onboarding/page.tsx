import Link from "next/link";

/** 온보딩 UI가 완성되기 전에도 유효한 진입 경로를 제공합니다. */
export default function OnboardingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <h1 className="text-20 font-semibold text-green-700">소품지도</h1>
      <p className="mt-2 text-14 text-black-500">
        취향에 맞는 소품샵을 찾는 지도를 준비하고 있어.
      </p>
      <Link
        href="/login"
        className="mt-6 flex min-h-11 items-center justify-center rounded-xl bg-green-500 px-5 text-14 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
      >
        로그인 화면으로 이동
      </Link>
    </main>
  );
}
