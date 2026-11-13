"use client";

import type { Ref } from "react";

import {
  SHOP_REGION_GROUP_LABELS,
  type CourseDetailData,
} from "@sopum-map/shared";

import { getCourseAuthorDisplayName } from "../_utils/course-author";
import { ChevronLeftIcon, ChevronUpIcon, MoreIcon } from "@/components/icons";
import { CourseLikeButton } from "./CourseLikeButton";
import { Badge } from "@/components/ui/Badge/Badge";

type Props = Readonly<{
  course: CourseDetailData;
  visibilityPending: boolean;
  currentUserNickname?: string;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
  onVisibilityClick: () => void;
  infoOpen: boolean;
  onCloseInfo: () => void;
  onOpenInfo: () => void;
  infoSectionRef: Ref<HTMLElement>;
}>;

/** 코스의 이동·공유 액션과 작성자별 상태를 한곳에 표시합니다. */
export function CourseDetailHeader({
  course,
  visibilityPending,
  currentUserNickname,
  onBack,
  onShare,
  onMore,
  onVisibilityClick,
  infoOpen,
  onCloseInfo,
  onOpenInfo,
  infoSectionRef,
}: Props) {
  /** 이전 API 응답이 캐시에 남아 있어도 상세 화면 전체가 중단되지 않게 합니다. */
  const authorDisplayName = getCourseAuthorDisplayName({
    authorDisplayName: course.author?.displayName,
    courseType: course.courseType,
    isOwner: course.isOwner,
    currentUserNickname,
  });

  const createdDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(course.createdAt));
  const showOfficialPick =
    course.courseType === "user_created" &&
    course.isPublic &&
    course.isOfficialPick;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 화면"
          onClick={onBack}
          className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/85 shadow-card backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <ChevronLeftIcon className="size-6" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="코스 공유"
            onClick={onShare}
            className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/85 shadow-card backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                d="M12 15V3m0 0L8 7m4-4 4 4M5 11v8h14v-8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {course.isOwner ? (
            <button
              type="button"
              aria-label="코스 더보기"
              onClick={onMore}
              className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/85 shadow-card backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <MoreIcon className="size-6" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {infoOpen ? (
        <section
          ref={infoSectionRef}
          aria-label="코스 정보"
          className="pointer-events-auto relative mt-3 rounded-card border border-white/70 bg-white/25 p-4 shadow-floating backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              {showOfficialPick ? (
                <Badge variant="pink" size="small">
                  소품지도 Pick
                </Badge>
              ) : null}
              <Badge>{SHOP_REGION_GROUP_LABELS[course.regionGroup]}</Badge>
            </div>
            <button
              type="button"
              aria-label="코스 정보 접기"
              onClick={onCloseInfo}
              className="grid size-8 shrink-0 place-items-center rounded-full text-black-600 hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <ChevronUpIcon className="size-4" aria-hidden="true" />
            </button>
          </div>

          <h1 className="mt-2 line-clamp-2 text-20 font-semibold leading-7">
            {course.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-12 text-black-500">
            <span>by {authorDisplayName}</span>
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
            <p className="mt-2 line-clamp-2 whitespace-pre-line text-13 text-black-600">
              {course.description}
            </p>
          ) : null}

          <div className="mt-3 flex justify-end">
            {course.isOwner ? (
              <button
                type="button"
                aria-label="공개 상태 변경"
                disabled={visibilityPending}
                onClick={onVisibilityClick}
                className="rounded-full bg-green-50 px-3 py-2 text-10 font-semibold text-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:opacity-50"
              >
                {course.isPublic ? "공개" : "비공개"}
              </button>
            ) : (
              <CourseLikeButton
                key={course.id}
                courseId={course.id}
                initialIsLiked={course.isLiked}
                initialLikeCount={course.likeCount}
              />
            )}
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={onOpenInfo}
          className="pointer-events-auto mt-3 rounded-full bg-white/85 px-4 py-2 text-13 font-semibold shadow-card backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          코스 정보
        </button>
      )}
    </header>
  );
}
