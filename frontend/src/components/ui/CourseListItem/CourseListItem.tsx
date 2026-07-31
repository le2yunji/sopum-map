import Image from "next/image";
import Link from "next/link";

import type { CourseListItemProps } from "./CourseListItem.type";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";
const THUMBNAIL_IMAGE_COUNT = 4;

export const CourseListItem = ({
  id,
  title,
  description,
  imageUrls,
  tags,
}: CourseListItemProps) => {
  const thumbnailImages = Array.from(
    { length: THUMBNAIL_IMAGE_COUNT },
    (_, index) => imageUrls[index] || DEFAULT_SHOP_IMAGE,
  );

  return (
    <Link
      href={`/courses/${id}`}
      aria-label={`${title} 코스 상세 보기`}
      className="
        group flex w-full items-center gap-4 rounded-xl py-3
        transition-colors
        hover:bg-black-100/50
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-green-500
      "
    >
      <div
        className="
          grid size-20 shrink-0
          grid-cols-2 grid-rows-2
          overflow-hidden rounded-2xl
          bg-black-100
        "
      >
        {thumbnailImages.map((imageUrl, index) => {
          return (
            <div
              key={`${imageUrl}-${index}`}
              className="relative overflow-hidden"
            >
              <Image
                fill
                src={imageUrl}
                alt={`${title} 매장 이미지 ${index + 1}`}
                sizes="40px"
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

        <p className="mt-1 truncate text-12 text-black-600">{description}</p>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => {
              return (
                <span
                  key={tag}
                  className="
                    rounded bg-accent-pink/20
                    px-2 py-1
                    text-12 font-medium text-accent-rose
                  "
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <ChevronRightIcon
        className="
          size-5 shrink-0 text-accent-pink
          transition-transform duration-200
          group-hover:translate-x-0.5
        "
      />
    </Link>
  );
};

type ChevronRightIconProps = {
  className?: string;
};

const ChevronRightIcon = ({ className = "" }: ChevronRightIconProps) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
