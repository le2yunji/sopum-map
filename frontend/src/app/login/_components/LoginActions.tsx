"use client";

import Link from "next/link";

import { startKakaoLogin } from "@/api/auth/auth.api";

import { SocialLoginButton } from "./SocialLoginButton/SocialLoginButton";
import { useSearchParams } from "next/navigation";

export function LoginActions() {
  const searchParams = useSearchParams();

  const handleKakaoLogin = () => {
    const returnTo = searchParams.get("returnTo") ?? "/";

    startKakaoLogin(returnTo);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2.5">
      <SocialLoginButton provider="kakao" onClick={handleKakaoLogin} />

      <Link href="/" className="p-4 text-12">
        계정없이 둘러보기
      </Link>
    </div>
  );
}
