"use client";

import {
  SHOP_REGION_GROUP_LABELS,
  TAG_DEFINITION_BY_KEY,
} from "@sopum-map/shared";
import Image from "next/image";
import Link from "next/link";
import type { SyntheticEvent } from "react";

import { HeartIcon } from "@/components/icons";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

import { Badge } from "../Badge/Badge";
import type { CourseListItemProps } from "./CourseListItem.type";

const MAX_THUMBNAIL_COUNT = 4;
const MAX_REPRESENTATIVE_TAG_COUNT = 2;

const thumbnailGridStyles: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-2 grid-rows-1",
  3: "grid-cols-2 grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

/** 깨진 코스 이미지는 상점 기본 이미지로 한 번만 교체합니다. */
function replaceBrokenImageWithFallback(
  event: SyntheticEvent<HTMLImageElement>,
) {
  if (event.currentTarget.src.endsWith(DEFAULT_IMAGES.shop)) {
    return;
  }

  event.currentTarget.removeAttribute("srcset");
  event.currentTarget.src = DEFAULT_IMAGES.shop;
}

/** 공개 코스의 사진, 작성자, 대표 특징과 좋아요 수를 한 카드에 표시합니다. */
export function CourseListItem({
  course,
  imageLoading = "lazy",
}: CourseListItemProps) {
  const thumbnailImages =
    course.imageUrls.length > 0
      ? course.imageUrls.slice(0, MAX_THUMBNAIL_COUNT)
      : [DEFAULT_IMAGES.shop];
  const thumbnailCount = thumbnailImages.length;
  const authorDisplayName =
    course.courseType === "recommended"
      ? "소품지도"
      : course.author.displayName;
  const showOfficialPick =
    course.courseType === "user_created" && course.isOfficialPick;

  return (
    <Link
      href={`/courses/${course.id}`}
      aria-label={`${course.title} 코스 상세 보기`}
      className="group flex w-full items-center gap-3 rounded-card py-4 transition-colors hover:bg-black-100/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
    >
      <div
        className={[
          "grid size-20 shrink-0 gap-0.5",
          "overflow-hidden rounded-card bg-white",
          thumbnailGridStyles[thumbnailCount],
        ].join(" ")}
      >
        {thumbnailImages.map((imageUrl, index) => {
          const isFirstImageInThreeImageLayout =
            thumbnailCount === 3 && index === 0;

          return (
            <div
              key={`${imageUrl}-${index}`}
              className={[
                "relative overflow-hidden bg-black-100",
                isFirstImageInThreeImageLayout ? "row-span-2" : "",
              ].join(" ")}
            >
              <Image
                fill
                src={imageUrl}
                alt={`${course.title} 코스 상점 이미지 ${index + 1}`}
                sizes="80px"
                loading={imageLoading}
                onError={replaceBrokenImageWithFallback}
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          );
        })}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-16 font-medium text-black-950">
          {course.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-12 text-black-600">
          {course.description ? (
            <>
              <span>{course.description}</span>
              <span aria-hidden="true"> · </span>
            </>
          ) : null}
          <span>by {authorDisplayName}</span>
        </p>

        <div className="mt-2 flex items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {showOfficialPick ? (
              <Badge variant="pink" size="small">
                소품지도 Pick
              </Badge>
            ) : null}

            <Badge size="small">
              {SHOP_REGION_GROUP_LABELS[course.regionGroup]}
            </Badge>

            {course.representativeTagKeys
              .slice(0, MAX_REPRESENTATIVE_TAG_COUNT)
              .map((tagKey) => (
                <Badge key={tagKey} variant="softGreen" size="small">
                  {TAG_DEFINITION_BY_KEY[tagKey].label}
                </Badge>
              ))}
          </div>

          <span
            aria-label={`좋아요 ${course.likeCount}개`}
            className="flex shrink-0 items-center gap-0.5 text-12 text-black-500"
          >
            <HeartIcon className="size-4" aria-hidden="true" />
            <span>{course.likeCount}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
