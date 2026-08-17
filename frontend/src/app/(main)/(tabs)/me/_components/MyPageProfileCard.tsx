"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  ChevronRightIcon,
  PenIcon,
  ProfileFlowerIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";

const DEFAULT_PROFILE_IMAGE = "/images/profiles/user_default.webp";

/** 프로필 표시와 로컬 편집 상태를 한 경계에서 관리합니다. */
export function MyPageProfileCard() {
  const [nickname, setNickname] = useState("소품 수집가");
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [profileImageUrl, setProfileImageUrl] = useState(DEFAULT_PROFILE_IMAGE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  /** 새 로컬 미리보기가 생기거나 화면을 떠날 때 이전 URL을 해제합니다. */
  useEffect(() => {
    return () => {
      if (profileImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [profileImageUrl]);

  /** 현재 프로필 값을 편집 폼에 복사해 안전하게 편집을 시작합니다. */
  const startEditing = () => {
    setDraftNickname(nickname);
    setIsSaved(false);
    setIsEditing(true);
  };

  /** 비어 있지 않은 닉네임만 로컬 프로필에 반영합니다. */
  const saveProfile = () => {
    const nextNickname = draftNickname.trim();

    if (!nextNickname) {
      return;
    }

    setNickname(nextNickname);
    setIsEditing(false);
    setIsSaved(true);
  };

  /** 선택한 이미지 파일을 브라우저 미리보기로 교체합니다. */
  const changeProfileImage = (file?: File) => {
    if (!file) {
      return;
    }

    setProfileImageUrl(URL.createObjectURL(file));
  };

  if (isEditing) {
    return (
      <section aria-label="프로필 편집" className="mt-5 rounded-2xl border border-green-100 bg-green-75 p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveProfile();
          }}
        >
          <label
            htmlFor="profile-image"
            className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-green-200 bg-white px-3 text-13 font-semibold"
          >
            프로필 이미지 변경
          </label>
          <input
            id="profile-image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => changeProfileImage(event.target.files?.[0])}
          />

          <label htmlFor="nickname" className="mt-3 block text-13 font-semibold">
            닉네임
          </label>
          <input
            id="nickname"
            value={draftNickname}
            maxLength={20}
            onChange={(event) => setDraftNickname(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-green-200 bg-white px-3 outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="mt-3 flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!draftNickname.trim()}>
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
        className="mt-5 flex min-h-24 w-full items-center rounded-2xl border border-green-100 bg-green-75 px-4 text-left transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <span className="relative grid size-16 shrink-0 place-items-center rounded-full border-2 border-green-400 bg-white">
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
          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-green-700 text-white">
            <PenIcon className="size-3" aria-hidden="true" />
          </span>
        </span>

        <span className="ml-4 min-w-0 flex-1">
          <strong className="block truncate text-16 font-semibold text-black-950">
            {nickname}
          </strong>
          <span className="mt-0.5 block text-12 text-black-500">소품샵 탐색가</span>
        </span>

        <ChevronRightIcon className="size-5 text-green-700" aria-hidden="true" />
      </button>

      {isSaved ? (
        <p role="status" className="mt-2 text-12 text-green-700">
          프로필이 저장되었습니다.
        </p>
      ) : null}
    </>
  );
}
