import { SocialLoginButton } from "@/app/login/_components/SocialLoginButton/SocialLoginButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-white">
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0
          bg-[
            radial-gradient(circle_at_90%_90%,rgba(110,183,70,0.16)_0%,transparent_42%),
            radial-gradient(circle_at_10%_100%,rgba(221,229,169,0.22)_0%,transparent_38%),
            linear-gradient(to_bottom,#ffffff_0%,#ffffff_58%,#f8fbf5_100%)
          ]
        "
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-10">
        <div className="flex w-full flex-col gap-2.5">
          <SocialLoginButton provider="naver" />

          <SocialLoginButton provider="google" />

          <SocialLoginButton provider="apple" />

          <SocialLoginButton provider="kakao" />
        </div>
      </div>
    </main>
  );
}
