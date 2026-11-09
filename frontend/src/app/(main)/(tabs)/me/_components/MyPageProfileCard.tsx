"use client";

import Image from "next/image";
import { useState } from "react";

import { ChevronRightIcon, ProfileFlowerIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";
import { DEFAULT_PROFILE_IMAGE } from "@/constants/image.constants";
import { useUpdateMyProfile } from "@/hooks/useUpdateMyProfile";
import { isApiError } from "@sopum-map/shared";

type MyPageProfileCardProps = Readonly<{
  nickname: string;
  profileImage: string | null;
}>;

/** 프로필 수정 오류를 사용자에게 보여줄 문구로 변환합니다. */
function getProfileUpdateErrorMessage(error: unknown) {
  if (isApiError(error) && error.code === "NICKNAME_ALREADY_EXISTS") {
    return error.message;
  }

  return "프로필을 저장하지 못했습니다. 다시 시도해주세요.";
}

/** 프로필 표시와 닉네임 편집 상태를 한 경계에서 관리합니다. */
export function MyPageProfileCard({
  nickname,
  profileImage,
}: MyPageProfileCardProps) {
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateProfileMutation = useUpdateMyProfile();

  const nextNickname = draftNickname.trim();

  const canSave =
    nextNickname.length >= 2 &&
    nextNickname.length <= 12 &&
    nextNickname !== nickname;

  const profileImageUrl = profileImage ?? DEFAULT_PROFILE_IMAGE;

  /** 현재 프로필 값을 편집 폼에 복사해 편집을 시작합니다. */
  const startEditing = () => {
    setDraftNickname(nickname);
    setIsSaved(false);
    setIsEditing(true);
  };

  /** 변경된 닉네임을 서버에 저장합니다. */
  const saveProfile = () => {
    if (!canSave || updateProfileMutation.isPending) {
      return;
    }

    updateProfileMutation.mutate(
      {
        nickname: nextNickname,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setIsSaved(true);
        },
      },
    );
  };

  /** 저장 중이 아니라면 편집을 취소합니다. */
  const cancelEditing = () => {
    if (updateProfileMutation.isPending) {
      return;
    }

    updateProfileMutation.reset();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <section
        aria-label="프로필 편집"
        className="mt-5 rounded-card-lg bg-surface-brand-strong p-4"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveProfile();
          }}
        >
          <label htmlFor="nickname" className=" block text-13 font-semibold">
            닉네임
          </label>

          <input
            id="nickname"
            value={draftNickname}
            required
            minLength={2}
            maxLength={12}
            disabled={updateProfileMutation.isPending}
            aria-invalid={updateProfileMutation.isError || undefined}
            aria-describedby={
              updateProfileMutation.isError
                ? "nickname-update-error"
                : undefined
            }
            onChange={(event) => {
              setDraftNickname(event.target.value);
              updateProfileMutation.reset();
            }}
            className="
              mt-2 min-h-11 w-full
              rounded-control
              border border-stroke-brand
              bg-surface-primary
              px-3 outline-none
              focus:ring-2
              focus:ring-brand-accent
              disabled:cursor-not-allowed
              disabled:bg-black-100
            "
          />
          {updateProfileMutation.isError ? (
            <p
              id="nickname-update-error"
              role="alert"
              className="mt-2 text-12 text-red-600"
            >
              {getProfileUpdateErrorMessage(updateProfileMutation.error)}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={updateProfileMutation.isPending}
              onClick={cancelEditing}
            >
              취소
            </Button>

            <Button
              type="submit"
              disabled={!canSave || updateProfileMutation.isPending}
              isLoading={updateProfileMutation.isPending}
            >
              저장
            </Button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="프로필 수정"
        onClick={startEditing}
        className="
            mt-5 flex min-h-24 w-full items-center
            rounded-card-lg
            bg-surface-brand-strong
            px-4 text-left
            transition-colors
            hover:bg-brand-soft-strong
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand
            focus-visible:ring-offset-2
          "
      >
        <span
          className="
              relative grid size-16 shrink-0 place-items-center
              rounded-full
              border-2 border-stroke-brand
              bg-surface-primary
            "
        >
          {profileImageUrl === DEFAULT_PROFILE_IMAGE ? (
            <ProfileFlowerIcon className="size-11" aria-hidden="true" />
          ) : (
            <Image
              fill
              priority
              sizes="64px"
              src={profileImageUrl}
              unoptimized={profileImageUrl.startsWith("blob:")}
              alt="프로필 이미지"
              className="rounded-full object-cover"
            />
          )}
        </span>

        <span className="ml-4 min-w-0 flex-1">
          <strong className="block truncate text-16 font-semibold text-fg-primary">
            {nickname}
          </strong>

          <span className="mt-0.5 block text-12 text-fg-tertiary">
            소품샵 탐색가
          </span>
        </span>

        <ChevronRightIcon className="size-5 text-fg-brand" aria-hidden="true" />
      </button>

      {isSaved ? (
        <p role="status" className="mt-2 text-12 text-green-700">
          프로필이 저장되었습니다.
        </p>
      ) : null}
    </>
  );
}
