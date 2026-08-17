import Image from "next/image";
import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons/ChevronRightIcon";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

import { Badge } from "../Badge/Badge";
import type { CourseListItemProps } from "./CourseListItem.type";

const MAX_THUMBNAIL_COUNT = 4;

const thumbnailGridStyles: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-2 grid-rows-1",
  3: "grid-cols-2 grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

export const CourseListItem = ({
  id,
  title,
  description,
  imageUrls,
  tags,
}: CourseListItemProps) => {
  const thumbnailImages =
    imageUrls.length > 0
      ? imageUrls.slice(0, MAX_THUMBNAIL_COUNT)
      : [DEFAULT_IMAGES.shop];

  const thumbnailCount = thumbnailImages.length;

  return (
    <Link
      href={`/courses/${id}`}
      aria-label={`${title} 코스 상세 보기`}
      className="
        group flex w-full items-center gap-4 rounded-xl py-4
        transition-colors
        hover:bg-black-100/50
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-green-500
      "
    >
      <div
        className={[
          "grid size-20 shrink-0 gap-0.5",
          "overflow-hidden rounded-2xl",
          "bg-white",
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
                alt={`${title} 매장 이미지 ${index + 1}`}
                sizes="80px"
                className="
                  object-cover
                  transition-transform duration-300
                  group-hover:scale-[1.03]
                "
              />
            </div>
          );
        })}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-16 font-medium text-black-950">{title}</h3>

        <p className="mt-1 truncate text-12 text-pink-900">{description}</p>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} shape="square" variant="pink" size="small">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <ChevronRightIcon
        className="
          size-5 shrink-0 text-pink-200
          transition-transform duration-200
          group-hover:translate-x-0.5
        "
      />
    </Link>
  );
};
