"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  SHOP_REGION_GROUP_LABELS,
  type MyCourseListItem,
} from "@sopum-map/shared";

type Props = Readonly<{
  course: MyCourseListItem;
}>;

export function CourseListCard({ course }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        router.push(`/courses/${course.id}`);
      }}
      className="
        flex w-full gap-4
        rounded-card
        border border-stroke-subtle
        bg-surface-primary
        p-4 text-left
        transition-colors
        hover:bg-surface-secondary
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand
        focus-visible:ring-offset-2
      "
    >
      {course.mainImageUrl ? (
        <div
          className="
              relative size-24 shrink-0
              overflow-hidden rounded-control
              bg-surface-muted
            "
        >
          <Image
            src={course.mainImageUrl}
            alt={course.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="size-24 shrink-0 rounded-control bg-surface-muted" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate text-16 font-semibold text-fg-primary">
            {course.title}
          </h2>

          <span className="shrink-0 text-12 text-fg-tertiary">
            {course.shopCount}곳
          </span>
        </div>

        {course.description ? (
          <p className="mt-2 line-clamp-2 text-13 text-fg-secondary">
            {course.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-12 text-fg-tertiary">
          <span>{SHOP_REGION_GROUP_LABELS[course.regionGroup]}</span>
          <span aria-hidden="true">·</span>
          <span>{course.isPublic ? "공개" : "비공개"}</span>
          <span aria-hidden="true">·</span>
          <span>좋아요 {course.likeCount}</span>
        </div>
      </div>
    </button>
  );
}
