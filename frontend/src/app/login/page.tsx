import { SocialLoginButton } from "@/app/login/_components/SocialLoginButton/SocialLoginButton";
import type { Metadata } from "next";
import Image from "next/image";
import { LoginActions } from "./_components/LoginActions";

export const metadata: Metadata = {
  title: "로그인",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="flex relative min-h-dvh overflow-hidden bg-white items-center justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-brand-gradient"
      />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-10 gap-[110px] items-center justify-center">
        <div>
          <Image
            src="/images/brand/logo.svg"
            alt="소품지도"
            width={129}
            height={129}
            priority
          />
        </div>
        <div className="flex w-full flex-col gap-2.5 items-center justify-center">
          <SocialLoginButton provider="apple" />

          <LoginActions />
        </div>
      </div>
    </main>
  );
}
