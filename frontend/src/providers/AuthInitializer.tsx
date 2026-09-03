"use client";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function AuthInitializer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: user, isPending, isError, error } = useCurrentUser();

  useEffect(() => {
    if (isPending) {
      console.log("[Auth] 사용자 조회 중");
      return;
    }

    if (isError) {
      console.error("[Auth] 사용자 조회 실패:", error);
      return;
    }

    console.log("[Auth] current user:", user);
  }, [user, isPending, isError, error]);

  return children;
}
