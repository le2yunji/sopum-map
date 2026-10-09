"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  SHOP_REGION_GROUP_LABELS,
  type CourseListItem,
} from "@sopum-map/shared";

type Props = Readonly<{
  course: CourseListItem;
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
        rounded-xl border border-black-100
        p-4 text-left
      "
    >
      {course.mainImageUrl ? (
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={course.mainImageUrl}
            alt={course.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="size-24 shrink-0 rounded-lg bg-black-100" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate text-16 font-semibold">{course.title}</h2>

          <span className="shrink-0 text-12 text-black-500">
            {course.shopCount}곳
          </span>
        </div>

        {course.description ? (
          <p className="mt-2 line-clamp-2 text-13 text-black-600">
            {course.description}
          </p>
        ) : null}

        <p className="mt-3 text-12 text-black-400">
          {SHOP_REGION_GROUP_LABELS[course.regionGroup]}
        </p>
      </div>
    </button>
  );
}
