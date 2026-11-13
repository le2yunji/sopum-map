"use client";

import { HeartIcon } from "@/components/icons";
import { Snackbar } from "@/components/ui/Snackbar";

import { useDebouncedCourseLike } from "../_hooks/useDebouncedCourseLike";

type CourseLikeButtonProps = Readonly<{
  courseId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}>;

/** 코스 좋아요 상태와 개수를 즉시 표시하고 마지막 입력만 저장합니다. */
export function CourseLikeButton({
  courseId,
  initialIsLiked,
  initialLikeCount,
}: CourseLikeButtonProps) {
  const { isLiked, likeCount, isLikePending, hasLikeError, onLikeToggle } =
    useDebouncedCourseLike({
      courseId,
      initialIsLiked,
      initialLikeCount,
    });

  return (
    <>
      <button
        type="button"
        aria-label="코스 좋아요"
        aria-pressed={isLiked}
        disabled={isLikePending}
        onClick={onLikeToggle}
        className="
          flex min-h-9 items-center gap-1
          rounded-full px-2
          text-black-700
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-green-700
          disabled:opacity-50
        "
      >
        <HeartIcon filled={isLiked} className="size-6" aria-hidden="true" />

        <span>{likeCount}</span>
      </button>

      <Snackbar
        open={hasLikeError}
        message="코스 좋아요를 변경하지 못했습니다."
      />
    </>
  );
}
