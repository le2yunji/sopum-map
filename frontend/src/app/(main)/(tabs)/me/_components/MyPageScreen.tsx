"use client";

import Link from "next/link";
import { useState } from "react";

import { LogoutIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogout } from "@/hooks/useLogout";

import { MyPageActivityMenu, MyPageSupportMenu } from "./MyPageMenu";
import { MyPageProfileCard } from "./MyPageProfileCard";

type Props = Readonly<{
  isEmpty?: boolean;
  state?: "success" | "loading" | "error";
}>;

/** 프로필과 사용자 활동으로 이동하는 마이페이지 허브를 제공합니다. */
export function MyPageScreen({ isEmpty = false, state = "success" }: Props) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const {
    data: user,
    isPending: isUserPending,
    isError: isUserError,
    refetch,
  } = useCurrentUser();

  const logoutMutation = useLogout();

  /**
   * UI Preview 또는 실제 사용자 조회 중인 경우
   * 동일한 Skeleton을 보여줍니다.
   */
  if (state === "loading" || isUserPending) {
    return <MyPageSkeleton />;
  }

  /**
   * Preview 오류 또는 실제 /auth/me 조회 오류
   */
  if (state === "error" || isUserError) {
    return (
      <StatePanel
        title="마이페이지를 불러오지 못했습니다."
        action="다시 시도"
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  /**
   * /auth/me가 401을 반환하면
   * useCurrentUser()의 user는 null입니다.
   */
  if (!user) {
    return (
      <StatePanel
        title="로그인하고 취향 기록을 모아보세요."
        actionHref="/login"
        action="로그인"
      />
    );
  }

  return (
    <main className="min-h-full bg-white px-4 pt-10 pb-28">
      <h1 className="px-1 text-24 font-semibold text-black-950">마이페이지</h1>

      <MyPageProfileCard
        nickname={user.nickname}
        profileImage={user.profileImage}
      />

      <MyPageActivityMenu isEmpty={isEmpty} />

      <MyPageSupportMenu />

      <Button
        fullWidth
        variant="ghost"
        leftIcon={<LogoutIcon />}
        className="mt-4 border border-black-100 bg-white font-regular text-black-400 hover:bg-black-100"
        onClick={() => {
          setIsLogoutConfirmOpen(true);
        }}
        disabled={logoutMutation.isPending}
      >
        로그아웃
      </Button>

      {isLogoutConfirmOpen ? (
        <section role="alert" className="mt-4 rounded-2xl bg-green-50 p-5">
          <p className="font-semibold">로그아웃하시겠어요?</p>

          <p className="mt-1 text-12 text-black-500">
            저장한 취향 기록은 그대로 유지됩니다.
          </p>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsLogoutConfirmOpen(false);
              }}
              disabled={logoutMutation.isPending}
            >
              취소
            </Button>

            <Button
              aria-label="로그아웃 확인"
              onClick={() => {
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃 확인"}
            </Button>
          </div>

          {logoutMutation.isError ? (
            <p role="alert" className="mt-3 text-12">
              로그아웃하지 못했습니다. 다시 시도해주세요.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

/** 마이페이지의 최종 배치를 유지하는 로딩 상태입니다. */
function MyPageSkeleton() {
  return (
    <main className="p-4 pt-10">
      <Skeleton
        label="마이페이지를 불러오는 중"
        className="h-8 w-32 rounded-xl"
      />

      <Skeleton announce={false} className="mt-5 h-24 rounded-2xl" />

      <Skeleton announce={false} className="mt-4 h-30 rounded-2xl" />

      <Skeleton announce={false} className="mt-4 h-15 rounded-2xl" />

      <Skeleton announce={false} className="mt-2 h-15 rounded-2xl" />
    </main>
  );
}

type StatePanelProps = Readonly<{
  title: string;
  action: string;
  actionHref?: string;
  onAction?: () => void;
}>;

/** 로그인 안내와 오류 복구를 같은 화면 밀도로 제공합니다. */
function StatePanel({ title, action, actionHref, onAction }: StatePanelProps) {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <p className="text-16 text-black-500">{title}</p>

        {actionHref ? (
          <Link
            href={actionHref}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-green-500 px-5 text-14 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            {action}
          </Link>
        ) : (
          <Button className="mt-5" onClick={onAction}>
            {action}
          </Button>
        )}
      </div>
    </main>
  );
}
