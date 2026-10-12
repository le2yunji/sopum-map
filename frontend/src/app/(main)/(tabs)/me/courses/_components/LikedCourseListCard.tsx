"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  SHOP_REGION_GROUP_LABELS,
  type LikedCourseListItem,
} from "@sopum-map/shared";

import { HeartIcon } from "@/components/icons";

type Props = Readonly<{
  course: LikedCourseListItem;
  isUnlikePending: boolean;
  onPrivateClick: () => void;
  onUnlike: (courseId: string) => void;
}>;

/** 공개 정보 보호 규칙에 맞춰 찜한 코스 카드와 해제 액션을 표시합니다. */
export function LikedCourseListCard({
  course,
  isUnlikePending,
  onPrivateClick,
  onUnlike,
}: Props) {
  const router = useRouter();

  if (course.isPrivate) {
    return (
      <article className="flex items-center gap-3 rounded-card border border-stroke-subtle bg-surface-primary p-4">
        <button
          type="button"
          aria-label="비공개 코스 열기"
          onClick={onPrivateClick}
          className="min-h-16 min-w-0 flex-1 rounded-control text-left focus-visible:outline-2 focus-visible:outline-brand"
        >
          <span className="block text-16 font-semibold text-fg-primary">비공개 코스</span>
          <span className="mt-1 block text-13 text-fg-tertiary">작성자가 공개를 중단했어요.</span>
        </button>
        <button
          type="button"
          aria-label="비공개 코스 찜 해제"
          disabled={isUnlikePending}
          onClick={() => onUnlike(course.id)}
          className="grid size-11 shrink-0 place-items-center rounded-full text-pink-500 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
        >
          <HeartIcon filled className="size-6" aria-hidden="true" />
        </button>
      </article>
    );
  }

  return (
    <article className="flex gap-2 rounded-card border border-stroke-subtle bg-surface-primary p-4">
      <button
        type="button"
        onClick={() => router.push(`/courses/${course.id}`)}
        className="flex min-w-0 flex-1 gap-4 rounded-control text-left focus-visible:outline-2 focus-visible:outline-brand"
      >
        {course.mainImageUrl ? (
          <span className="relative size-24 shrink-0 overflow-hidden rounded-control bg-surface-muted">
            <Image src={course.mainImageUrl} alt="" fill sizes="96px" className="object-cover" />
          </span>
        ) : (
          <span className="size-24 shrink-0 rounded-control bg-surface-muted" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-16 font-semibold text-fg-primary">{course.title}</span>
          <span className="mt-1 block text-12 text-fg-secondary">by {course.author.displayName}</span>
          <span className="mt-3 flex flex-wrap items-center gap-2 text-12 text-fg-tertiary">
            <span>{SHOP_REGION_GROUP_LABELS[course.regionGroup]}</span>
            <span aria-hidden="true">·</span>
            <span>{course.shopCount}곳</span>
            <span aria-hidden="true">·</span>
            <span>좋아요 {course.likeCount}</span>
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={`${course.title} 찜 해제`}
        disabled={isUnlikePending}
        onClick={() => onUnlike(course.id)}
        className="grid size-11 shrink-0 place-items-center rounded-full text-pink-500 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
      >
        <HeartIcon filled className="size-6" aria-hidden="true" />
      </button>
    </article>
  );
}
