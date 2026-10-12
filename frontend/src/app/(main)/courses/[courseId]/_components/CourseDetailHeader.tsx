"use client";

import type { CourseDetailData } from "@sopum-map/shared";

import { ChevronLeftIcon, HeartIcon } from "@/components/icons";

type Props = Readonly<{
  course: CourseDetailData;
  likePending: boolean;
  visibilityPending: boolean;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
  onLikeToggle: () => void;
  onVisibilityClick: () => void;
}>;

/** 코스의 이동·공유 액션과 작성자별 상태를 한곳에 표시합니다. */
export function CourseDetailHeader({
  course,
  likePending,
  visibilityPending,
  onBack,
  onShare,
  onMore,
  onLikeToggle,
  onVisibilityClick,
}: Props) {
  const createdDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(course.createdAt));

  return (
    <header>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 화면"
          onClick={onBack}
          className="grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-green-700"
        >
          <ChevronLeftIcon className="size-6" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="코스 공유"
            onClick={onShare}
            className="grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-green-700"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 15V3m0 0L8 7m4-4 4 4M5 11v8h14v-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {course.isOwner ? (
            <button
              type="button"
              aria-label="코스 더보기"
              onClick={onMore}
              className="grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-green-700"
            >
              <span aria-hidden="true" className="text-24 leading-none">•••</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-start justify-between gap-4">
          <h1 className="min-w-0 text-24 font-semibold leading-8">{course.title}</h1>

          {course.isOwner ? (
            <button
              type="button"
              aria-label="공개 상태 변경"
              disabled={visibilityPending}
              onClick={onVisibilityClick}
              className="shrink-0 rounded-full bg-green-50 px-3 py-2 text-12 font-semibold text-green-700 focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50"
            >
              {course.isPublic ? "공개" : "비공개"}
            </button>
          ) : (
            <button
              type="button"
              aria-label="코스 좋아요"
              aria-pressed={course.isLiked}
              disabled={likePending}
              onClick={onLikeToggle}
              className="flex min-h-11 shrink-0 items-center gap-1 rounded-full px-2 text-black-700 focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50"
            >
              <HeartIcon filled={course.isLiked} className="size-7" aria-hidden="true" />
              <span>{course.likeCount}</span>
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-14 text-black-500">
          <span>by {course.author.displayName}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={course.createdAt}>{createdDate}</time>
          {course.isOwner ? (
            <>
              <span aria-hidden="true">·</span>
              <span>좋아요 {course.likeCount}</span>
            </>
          ) : null}
        </div>

        {course.description ? (
          <p className="mt-4 whitespace-pre-line text-14 text-black-600">
            {course.description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
