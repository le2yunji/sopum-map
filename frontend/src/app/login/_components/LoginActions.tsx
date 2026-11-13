"use client";

import Link from "next/link";

import { startKakaoLogin } from "@/api/auth/auth.api";

import { SocialLoginButton } from "./SocialLoginButton/SocialLoginButton";
import { useSearchParams } from "next/navigation";
import { Snackbar } from "@/components/ui/Snackbar";

export function LoginActions() {
  const searchParams = useSearchParams();
  const showAuthRequiredSnackbar =
    searchParams.get("reason") === "auth-required";

  /** 로그인 완료 후 돌아갈 페이지를 포함해 카카오 로그인을 시작합니다. */
  const handleKakaoLogin = () => {
    const returnTo = searchParams.get("returnTo") ?? "/";

    startKakaoLogin(returnTo);
  };

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-2.5">
        <SocialLoginButton provider="kakao" onClick={handleKakaoLogin} />

        <Link href="/" className="p-4 text-12">
          계정없이 둘러보기
        </Link>
      </div>

      <Snackbar
        open={showAuthRequiredSnackbar}
        message="로그인이 필요합니다."
      />
    </>
  );
}
