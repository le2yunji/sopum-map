"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  createAuthRequiredLoginPath,
  type ProtectedRoute,
} from "./auth-navigation";

type AuthGuardProps = Readonly<{
  children: ReactNode;
  returnTo: ProtectedRoute;
}>;

/** 로그인한 사용자에게만 하위 화면을 보여줍니다. */
export function AuthGuard({ children, returnTo }: AuthGuardProps) {
  const router = useRouter();

  const { data: currentUser, isPending, isError, refetch } = useCurrentUser();

  useEffect(() => {
    if (isPending || isError || currentUser) {
      return;
    }

    router.replace(createAuthRequiredLoginPath(returnTo));
  }, [currentUser, isError, isPending, returnTo, router]);

  if (isPending) {
    return null;
  }
  if (isError) {
    return (
      <StatePanel
        title="로그인 상태를 확인하지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
        action="다시 시도"
        onAction={() => void refetch()}
      />
    );
  }

  if (!currentUser) {
    return null;
  }

  return children;
}
