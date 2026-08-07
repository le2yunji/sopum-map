import Image from "next/image";

import type { ShopCardProps, ShopCardVariant } from "./ShopCard.types";
import { HeartIcon } from "@/components/icons/HeartIcon";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

const cardClassNames: Record<ShopCardVariant, string> = {
  default: "flex flex-col gap-3 max-w-40",
  compact: "flex flex-col gap-2 max-w-40",
};

const imageWrapperClassNames: Record<ShopCardVariant, string> = {
  default:
    "relative aspect-square w-full overflow-hidden rounded-xl border border-gray-100",
  compact:
    "relative aspect-square w-full overflow-hidden rounded-lg border border-gray-100",
};

const titleClassNames: Record<ShopCardVariant, string> = {
  default: "text-base font-semibold",
  compact: "text-sm font-semibold",
};

export const ShopCard = ({
  name,
  imageUrl,
  region,
  tags,
  isLiked = false,
  variant = "default",
  onLikeClick,
}: ShopCardProps) => {
  const isCompact = variant === "compact";

  return (
    <article className={cardClassNames[variant]}>
      <div className={imageWrapperClassNames[variant]}>
        <Image
          src={imageUrl || DEFAULT_SHOP_IMAGE}
          alt={`${name} 매장 이미지`}
          fill
          className="object-cover"
          sizes="160px"
        />

        {!isCompact && (
          <button
            type="button"
            aria-label={isLiked ? "찜 해제" : "찜하기"}
            aria-pressed={isLiked}
            onClick={onLikeClick}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-2"
          >
            <HeartIcon filled={isLiked} className="size-4.5 text-accent-rose" />
          </button>
        )}
      </div>

      <div className="min-w-0">
        <h3 className={`${titleClassNames[variant]} truncate`}>{name}</h3>
        <div>
          {tags.map((tag) => {
            return (
              <span className="mb-1 text-xs text-gray-500" key={tag}>
                #{tag}
              </span>
            );
          })}
        </div>
        <p className="mt-1 truncate text-xs text-gray-700">{region}</p>
      </div>
    </article>
  );
};
